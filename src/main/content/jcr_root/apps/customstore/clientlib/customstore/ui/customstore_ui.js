if (CQ_Analytics.CustomStoreMgr) {

    CQ_Analytics.CustomStoreMgr.template =
            "%companyName%<br>DUNS: %duns%<br>Risk: %risk%<br><input class='customstore-input' type='text' id='customstore-input-naics' name='naics' value='%naics%'>" +
            "<label for='customstore-input-naics'>NAICS Industry Code</label>";

    CQ_Analytics.CustomStoreMgr.templateRenderer = function (naics, name, duns, risk) {
        var template = CQ_Analytics.CustomStoreMgr.template;
        return template.replace(/%naics%/g, naics)
                .replace(/%companyName%/g, name)
                .replace(/%duns%/g, duns)
                .replace(/%risk%/g, risk);
    }


    CQ_Analytics.CustomStoreMgr.renderer = function (store, divId) {

        CQ_Analytics.CustomStoreMgr.loadData();
        $CQ("#" + divId).children().remove();

        var name = CQ_Analytics.ProfileDataMgr.getProperty("formattedName");
        var templateRenderer = CQ_Analytics.CustomStoreMgr.templateRenderer;

        $CQ("#" + divId).addClass("cq-cc-customstore");
        var div = $CQ("<div>").html(name + " profile");
        $CQ("#" + divId).append(div);

        var data = this.getJSON();

        console.log('data: ' + JSON.stringify(data));

        if (data) {
            for (var i in data) {
                if (typeof data[i] === 'object') {
                    $CQ("#" + divId).append(templateRenderer(data[i].naics, data[i].companyName, data[i].duns, data[i].risk));
                }
            }
        }

    }
    CQ_Analytics.ClickstreamcloudMgr.register(CQ_Analytics.CustomStoreMgr);
}