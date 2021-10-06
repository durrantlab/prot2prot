// This file is part of Prot2Prot, released under the Apache 2.0 License. See
// LICENSE.md or go to https://opensource.org/licenses/Apache-2.0 for full
// details. Copyright 2021 Jacob D. Durrant.


import * as UI from "./UI/UI";
import * as VueSetup from "./VueInterface/Setup";
import { VERSION } from "./Version";
import { hasNextLigandUrlParam } from './URLParams';
import { createFileSystemDatabase } from "./UI/Forms/FileLoader/DataBase";
declare var ga;

console.log("Prot2Prot Web App " + VERSION);

// Create/load the database.
createFileSystemDatabase(
    ["receptor"], // , "ligand", "crystal", "output"],
    // delete previous database if "nextLigand" not in url
    !hasNextLigandUrlParam()
)
.then(() => {
    // Setup Vue
    VueSetup.setup();

    // Setup UI
    UI.setup();
});

// If the url has "durrantlab" in it, contact google analytics. Logging all
// usage would be ideal for grant reporting, but some users may wish to run
// versions of Prot2Prot on their own servers specifically to maintain privacy
// (e.g., in case of proprietary data). Calls to google analytics in such
// scenarios could be alarming, even though I'm only recording basic
// demographics anyway.
if (window.location.href.indexOf("durrantlab") !== -1) {
    setTimeout(() => {
        // Just to make sure it isn't blocking...
        (function(i, s, o, g, r, a, m) {
            i['GoogleAnalyticsObject'] = r;
            i[r] = i[r] || function() {
                (i[r].q = i[r].q || []).push(arguments)
            }, i[r].l = 1 * new Date().getTime();
            a = s.createElement(o);
            m = s.getElementsByTagName(o)[0];
            a.async = 1;
            a.src = g;
            m.parentNode.insertBefore(a, m)
        })(window, document, 'script', 'https://www.google-analytics.com/analytics.js', 'ga');
        ga('create', 'UA-144382730-1', {
            'name': 'prot2prot'
        });

        // UA-144382730-1 reports to pcaviz account.
        ga('prot2prot.send', {
            "hitType": 'event',
            "eventCategory": 'prot2prot',
            "eventAction": 'pageview',
            "eventLabel": window.location.href
        });
    }, 0)
}
