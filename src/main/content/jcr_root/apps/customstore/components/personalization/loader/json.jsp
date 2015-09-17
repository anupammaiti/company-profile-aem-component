<%@ page session="false" import="com.day.cq.security.User" %>
<%@ page session="false" import="com.day.cq.security.profile.Profile" %>
<%@ page session="false" import="com.day.cq.security.profile.ProfileManager" %>
<%@ page session="false" import="org.apache.sling.commons.json.io.JSONWriter" %>
<%@ page session="false" import="org.jsoup.Jsoup" %>
<%@ page session="false" import="java.net.URLEncoder" %>
<%@ page session="false" import="java.util.List" %>

<%@include file="/libs/foundation/global.jsp" %><%

        response.setContentType("application/json");
        response.setCharacterEncoding("utf-8");

        String authorizableId = request.getParameter("authorizableId");
        String ip = request.getParameter("ip");
        Profile profile = null;
        ProfileManager pMgr = sling.getService(ProfileManager.class);

        JSONWriter w = new JSONWriter(response.getWriter());

        w.object();

        if (authorizableId != null) {
            try {
                profile = pMgr.getProfile(authorizableId, resourceResolver.adaptTo(Session.class));
            } catch (RepositoryException e) {
                slingResponse.setStatus(HttpServletResponse.SC_UNAUTHORIZED, "");
            }
        } else {
            profile = resourceResolver.adaptTo(User.class).getProfile();
        }

        org.jsoup.Connection.Response resp = null;

        try {
            resp = Jsoup.connect("https://services.labs.dnbdirectapps.com/service/directPlusProxy?directPath=" + URLEncoder.encode("v1/duns-search/ipresource/" + ip + "?ipDomainType=biz"))
                    .timeout(30000).ignoreContentType(true).execute();
        } catch (Exception ex) {
            //logger.error(ExceptionUtils.getStackTrace(ex));
        }

        String body = resp.body().replaceAll("^\\s|\n\\s|\\s$", "");
        String duns = body.split("duns\":\"")[1].split("\"")[0];

        if (duns != null) {
            String name = null;
            String naics = null;
            String globalUltimateName = null;
            String globalUltimateDuns = null;
            String risk = null;
            try {
                resp = Jsoup.connect("https://services.labs.dnbdirectapps.com/service/direct2Proxy?directPath=" + URLEncoder.encode("V3.0/organizations/" + duns + "/products/DCP_ENH"))
                        .timeout(30000).ignoreContentType(true).execute();
            } catch (Exception ex) {
                //logger.error(ExceptionUtils.getStackTrace(ex));
            }
            if (resp != null && 200 == resp.statusCode()) {
                body = resp.body().replaceAll("^\\s|\n\\s|\\s$", "");
                name = body.split("OrganizationName\":\\{\"\\$\":\"")[1].split("\"")[0];
                if (body.contains("\"NAICS\"")) {
                    naics = body.split("\"NAICS\",\"IndustryCode\":\\{\"\\$\":\"")[1].split("\"")[0];
                }
                if (body.contains("\"MarketingRiskClassText\"")) {
                    String riskObj = body.split("MarketingRiskClassText\":\\{")[1].split("\\}")[0];
                    risk = riskObj.split("\\$\":\"")[1].split("\"")[0];
                }
                w.key("COMPANY/naics").value(naics);
                w.key("COMPANY/companyName").value(name);
                w.key("COMPANY/duns").value(duns);
                w.key("COMPANY/risk").value(risk);
            }
}
        w.endObject();
%>