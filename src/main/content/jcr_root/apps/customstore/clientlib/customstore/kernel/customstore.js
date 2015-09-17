if (!CQ_Analytics.CustomStoreMgr) {

    CQ_Analytics.CustomStoreMgr = CQ_Analytics.JSONStore.registerNewInstance("customstore");

    CQ_Analytics.CustomStoreMgr.currentId = "";

    CQ_Analytics.CustomStoreMgr.loadData = function () {

        console.info("Loading D&B data");

        var authorizableId = CQ_Analytics.ProfileDataMgr.getProperty("authorizableId");
        var url = "/apps/customstore/components/loader.json";

        if ((authorizableId !== CQ_Analytics.CustomStoreMgr.currentId) & CQ_Analytics.CustomStoreMgr.initialized) {


            var xmlHttp = new XMLHttpRequest();
            xmlHttp.open("GET", "http://ipinfo.io/ip", false);
            xmlHttp.send(null);
            var ip = xmlHttp.responseText.replace(/^\s+|\s+$/g, '');

            url = CQ_Analytics.Utils.addParameter(url, "authorizableId", authorizableId);

            url = CQ_Analytics.Utils.addParameter(url, "ip", ip);


            try {

                var object = CQ.shared.HTTP.eval(url);

                console.log("data object: " + JSON.stringify(object));

                if (object) {
                    this.data = object;
                }

            } catch (error) {
                console.log("Error", error);
            }

            CQ_Analytics.CustomStoreMgr.currentId = authorizableId;

        }

    };

    CQ_Analytics.CCM.addListener("configloaded", function () {

        CQ_Analytics.ProfileDataMgr.addListener("update", function () {
            this.loadData();
            this.fireEvent("update");
        }, CQ_Analytics.CustomStoreMgr);

    }, CQ_Analytics.CustomStoreMgr);

    CQ_Analytics.CustomStoreMgr.addListener("initialize", function () {
        this.loadData();
    });

    CQ_Analytics.CustomStoreMgr.initialized = false;

    CQ_Analytics.CustomStoreMgr.getValue = function (service) {
        if (CQ_Analytics.CustomStoreMgr.data) {
            if (CQ_Analytics.CustomStoreMgr.data[service])
                return  CQ_Analytics.CustomStoreMgr.data[service].value;
        }
        return "";
    }


}