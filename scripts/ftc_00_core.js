var FTC_PACKAGE_NAME = "dnd5e-foundry-tactics";
var FTC = {

    ROOT_DIR: 'workshop/'+FTC_PACKAGE_NAME+'/',
    TEMPLATE_DIR: 'workshop/'+FTC_PACKAGE_NAME+'/html/',
    CSS_DIR: 'workshop/'+FTC_PACKAGE_NAME+'/css/',

    /* ------------------------------------------- */

    getProperty: function(object, name) {
        /*
        Get object data by name with the format "part1.part2.part3" which would evaluate as obj[part1][part2][part3].
        If any of the requested parts are undefined, this method returns undefined.

        Arguments:
            object: The data object to traverse
            name: The composite property name to search for
        */
        var parts = name.split("."),
            data = object;
        for (var i = 0; i < parts.length; i++) {
            data = data[parts[i]];
            if (data === undefined) {
                break;
            }
        }
        return data;
    },

    /* ------------------------------------------- */

    setProperty: function(object, name, value, dtype) {

        // Sanitize Tags
        if ( name === "tags" ) {
            var tags = {};
            $.each(value.replace(" ", "").split(','), function(_, tag) {
               tags[tag] = true;
            });
            value = tags;
        }

        // Sanitize Values
        if (name.startsWith("stats.")) {
            value = parseInt((typeof(value) === "number") ? value : value.split(',').join(''));
            value = Math.min(Math.max(value, 0), 30);
        } else if (name.startsWith("counters.")) {
            value = parseInt((typeof(value) === "number") ? value : value.split(',').join(''));
            value = Math.max(value || 0, 0);
        }

        // Record Key
        var parts = name.split("."),
              key = parts.pop(-1),
             data = object.data;
        for (var i = 0; i < parts.length; i++) {
            part = parts[i];
            if (data[part] === undefined) data[part] = {};
            data = data[part];
        }

        // Set the value if it is defined
        if (value !== undefined && value !== "") data[key] = value;
        else delete data[key];

        // Save Object
        object.sync("updateAsset");
        return object;
    },
};


// An Prototypical Pattern for Rendering Rich Object Templates
class FTCObject {

    constructor(obj, app, scope) {
        this.obj = this.constructor.enrichObject(obj);
        this.app = app;
        this.scope = this.constructor.refineScope(scope);
    }

    /* ------------------------------------------- */

    static enrichObject(obj) {
        if ( "sync" in obj ) {
            obj.data = this.enrichData(obj.data);
        } else {
            var data = this.enrichData(obj);
            obj = sync.obj();
            obj.data = data;
        }
        return obj;
    }

    static enrichData(data) {
        /*
        Enrich object data by augmenting it with additional metadata and attributes

        Arguments:
            data: Object data to augment and enrich.

        Returns:
            Enriched object data.
        */
        return data;
    }

    static refineScope(scope) {
        return scope;
    }

    /* ------------------------------------------- */

    get data() {
        return this.obj.data;
    }

    /* ------------------------------------------- */

    getData(name) {
        /*
        Get object data by name with the format "part1.part2.part3" which would evaluate as obj[part1][part2][part3].
        If any of the requested parts are undefined, this method returns undefined.

        Arguments:
            object: The data object to traverse
            name: The composite property name to search for
        */
        var parts = name.split("."),
            value = this.data;
        for (var i = 0; i < parts.length; i++) {
            value = value[parts[i]];
            if (value === undefined) {
                break;
            }
        }
        return value;
    }

    /* ------------------------------------------- */

    setData(name, value, dtype) {

        // Sanitize Tags
        if ( name === "tags" ) {
            var tags = {};
            $.each(value.replace(" ", "").split(','), function(_, tag) {
               tags[tag] = true;
            });
            value = tags;
        }

        // Sanitize Values
        if (name.startsWith("stats.")) {
            value = parseInt((typeof(value) === "number") ? value : value.split(',').join(''));
            value = Math.min(Math.max(value, 0), 30);
        } else if (name.startsWith("counters.")) {
            value = parseInt((typeof(value) === "number") ? value : value.split(',').join(''));
            value = Math.max(value || 0, 0);
        }

        // Record Key
        var parts = name.split("."),
              key = parts.pop(),
             data = this.data;
        for (var i = 0; i < parts.length; i++) {
            var part = parts[i];
            if (data[part] === undefined) data[part] = {};
            data = data[part];
        }

        // Set the value if it is defined
        if (value !== undefined && value !== "") data[key] = value;
        else delete data[key];

        // Save Object
        this.obj.sync("updateAsset");
        return this.obj
    }

    /* ------------------------------------------- */

    renderHTML() {

        // Build Template and Populate Data
        var html = this.buildHTML();
        html = this.populateHTML(html);
        this.html = $(html);

        // Activate Tabs
        FTC.ui.activate_tabs(this.html, this.obj, this.app);

        // Activate Fields
        FTC.events.activateFields(this.html, this.obj, this.app);
        return this.html
    }

    buildHTML() {
        return "<div>{info.name.current}</div>";
    }

    populateHTML(html) {
        return FTC.template.populate(html, this.obj.data);
    }
}


/* -------------------------------------------- */
/* Document Ready                                */
/* -------------------------------------------- */

$(document).ready(function(){
    hook.call("FTCInit");
    $('body').append('<link rel="stylesheet" href="'+ FTC.CSS_DIR + 'FTC.css" type="text/css" />')
    console.log("FTC Loaded.");
});
