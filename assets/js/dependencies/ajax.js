var useDataTables = true;   // use datatables module (optional) for search results ... requires jquery.dataTables.min.css/js 

$(document).ready(function() {
  
    var scope = document;

    var parsedData = [];
    var foundData = [];   
    var searchOptions;

    var req = scope.querySelectorAll('[mandatory]');
   
   /********** Auto-complete Field Populated by AJAX Call to Database **********/
    $(":input[data-autocomplete]").each(function() {
        
        var ac_options = $(this).attr("data-autocomplete");                        // master field being set ... should match element id for related field 

        var local = {};
        if (ac_options) { 
            var options = ac_options.split(/\s*;\s*/);
            for ( i in options) {
                var setting = options[i];
                var kv = setting.split(/:/);
                local[kv[0]] = kv[1];
            }
        }
        var option_element = local['options_element'] || 'autocomplete-options';   // allow override of global if multiple autocomplete sections in document
        var globalElement = $('#' + option_element);
     
        var idField = $(this).id;
        var id = $(this).id;
 
        $(this).autocomplete({     
            source: function( request, response ) {

                console.log('local: ' + JSON.stringify(local));
                console.log('global: ' + JSON.stringify(globalElement));

                var Options = loadOptions(local, globalElement);

                console.log("Options:" + JSON.stringify(Options));

                var setFields = Options['set'];
                for (var i=0; i<= setFields.length; i++) {
                    /* CONSTRUCTION - need to adjust to enable 'ADD NEW RECORD' that doesn't clear other fields... */
                    if (setFields[i] == Options['field'])  { continue }   // leave current field as is...
                    $('#' + setFields[i]).val('');                      // clear all the other fields to start ... 
                }

                var query = Options['query'];
                var url   = Options['url'];

                console.log(query);
                console.log(url);

                Options['search'] = request.term;
                var dataKey = Options['dataKey'];
                var condition = Options['condition'];

                    console.log("optional CONDITION: " + condition);
                var add_condition = '';
                if (condition) {
                    var conditions = condition.match(/<\w+>/);
                    console.log('found ' + conditions.length + ' dynamic conditions');
                    for (var i=0; i<conditions.length; i++) {
                	    var element = conditions[i];
                	    element = element.replace(/^</,'');
                	    element = element.replace(/>$/,'');
                	    var value   = $('#' + element).val();

                	    if (value && value.match(/[0-9]/) ) {
                			console.log(i + ' Replace ' + conditions[i] + ' with ' + value);
                			condition = condition.replace(conditions[i], value);
                       }
                    }
                    if ( condition.match(/<\w+>/) ) { console.log("optional condition incomplete ... ignoring") }
                    else { add_condition = condition } 
                }

                var search = request.term;
                console.log("call post to search for " + request.term);

                $.ajax({
                    url: url,
                    dataType: "json",
                    method: "POST",
                    data: {
                        field : Options['field'],
                        query : query,
                        group : Options['group'],
                        search : search,
                        condition : add_condition,
                        type : Options['type']
                    },
                    success: function( data ) {	
                        console.log('url:' + url);
                        console.log("Search for '" + search + "' :");
                        console.log("query: " + query);
                        console.log(JSON.stringify(data));

                        if (dataKey && data[dataKey]) { data = data[dataKey] } // account for api results that may return data in a different format (eg { 'status' : 'ok', 'data' : [results]}) ... otherwise assume array of returned data rows ( [results] ) 
                        parsedData = parseData( data, Options);  // , request.term, 'message' );
                        
                        foundData = data;
                        searchOptions = Options;

                        var labels = foundData[0];

                        response( parsedData );
                   },
                    error: function( jqXHR, textStatus, err ) {
                        console.log('Ajax error: ' + err);
                    }
                })
                .done (function(msg) {
                    console.log('done function');
                    console.log(id + ' = ' + newval);
                    var newval = $('#' + id).val();
                })
                .fail (function( jqXHR, textStatus) {
                    console.log("Error running ajax script: " + textStatus);
                    console.log("url: " + url);
                });
            },
            minLength: 3,
            select: function( event, ui ) {
                var Options = loadOptions(local, globalElement);
                var setFields = Options['set'];
                console.log("Selected " + Options['field']);
                console.log( ui.item ?
                    "Selected Item: " + ui.item.label :
                    "Nothing selected, input was " + this.value);
                    // $('#' + id).val(this.value);  /* Reset the field specified  */
                
                var label = ui.item.label;
                
                var id = findWhere(parsedData, { 'label' : label })[0]['id'];
                console.log(label + " ID: " + id);
                console.log('Options: ' + JSON.stringify(Options));
                if (id) {		
                    var find = {};
                    var field = Options['field'];
                    var type = Options['type'];
                    
                    var attr = Options['field'];
                    if (Options['alias'] && Options['alias'][attr]) { attr = Options['alias'][attr] }

                    find[attr] = label;
                    console.log('search conditions');
                    console.log(Options['set']);
                    console.log(find);
                    var selected = findWhere(foundData, find);
                    console.log(selected.length + ' applicable records');
                    if (selected.length == 1) {
                      console.log(selected[0]);
                      for (var i=0; i<= setFields.length; i++) {
                        // var val = selected[0][setFields[i]];
                        var val = parseval(setFields[i], selected[0][setFields[i]]);
                        $('#' + setFields[i]).val(val);
                      }
                    }
                    else if (selected.length > 1) {
                        console.log('Multiple applicable records... please select from options below');
                    }

                    console.log("reset Search data to " + label);
                    parseData( foundData, searchOptions, label);
                }
                console.log("Reset search data to " + label);
                var chose = parseData( foundData, searchOptions, label);
 
            },
            open: function() {
              $( this ).removeClass( "ui-corner-all" ).addClass( "ui-corner-top" );
            },
            close: function() {
            
            }
        });
    });

});

/** Load Autocomplete options from Global settings, allowing local specification to override global settings .. **/
function loadOptions (local, element) {

    var settings = ['url', 'table', 'field', 'query', 'group', 'target', 'set', 'show', 'dataKey', 'displayBlock', 'condition', 'type', 'onSuccess', 'onEmpty'];
    var Options = {};
    var json = {};

    console.log("load autocomplete options");
    if ( element.attr('json') ) { json = JSON.parse(element.attr('json')) }

    for (var i=0; i<settings.length; i++) {
        var setting = settings[i];
        if (local[setting] === undefined) {
            Options[setting] = element.attr(setting) || json[setting] || '';
        }
        else {
            Options[setting] = local[setting];
        }
 
        if (setting == 'set') { Options[setting] = Options[setting].split(/\s*,\s*/) }  // convert set to array of fields 
    }
    
 
    if (! Options['alias']) Options['alias'] = {};

    if (Options['query']) {
        var aliasTest = new RegExp( '\\b\\S+ as \\w+\\b', 'ig');
        var foundAlias = Options['query'].match(aliasTest);
        
        if (foundAlias) {        
            for (var i=0; i<foundAlias.length; i++) {        
                var terms = foundAlias[i].split(' ');
                console.log('Alias TERMS: ' + JSON.stringify(terms));

                Options['alias'][terms[0]] = terms[2];
                Options['alias'][terms[2]] = terms[0];
            }
        }

    }


    console.log(JSON.stringify(Options));
    return Options;
}

function findWhere (data, spec) {
    var result = [];
    console.log(spec);
    for (k in spec) {
        for (i in data) {
             if (data[i][k] == spec[k]) {
              result.push(data[i]);
            }
        }
    }
    return result;
}

function cback (data) {
	console.log('callback data');
};

/********** Parse Data **********/
function parseData (data, Options, match) {
    
    var records = 0;
           
    var onSuccess = Options['onSuccess'] || "<caption><h4>Records Found with " + Options['field'] + " matching: '" + Options['search'] + "'</h4></caption>";
    var onEmpty   = Options['onEmpty'] || '<h3>No Applicable Records Found</h3>';

    var html = ''; // = "<h4> Search Results: </h4>\n<Form>\n";  
    html += "<TABLE id='searchData' class='table table-bordered table-hover table-condensed dataTable'>\n";
    
    if (data.length) { html += onSuccess + "\n" }

    var map = [] ;
    var Labels = {};
    var rows = 0;

    for (i in data) {
        var val = data[i];
        var kv = subObjects(val);
        if (kv) {
            if (!records) { 
                html += "<THEAD class='alert alert-success'>\n";
                html += addRow(kv[0], null, Options, 'success');
                html += "</THEAD>\n<TBODY>\n";
            }
            var id = kv[1][0];   // for now assume that the primary id field is the first in the list of vales... probably want to change to use a variable for the id field index ... 

            if (match) {
                /** if a specific option is selected, filters results to only show those matching selected value **/
 
                if ( kv[1].indexOf(match) > -1 ) {
                    html += addRow(kv[0],kv[1], Options);  
                    rows++;
                 }      
            }
            else {
                html += addRow(kv[0],kv[1], Options);
                rows++;
            }

            var label = getField(kv, Options['field']);

            if ( Options['alias'] && Options['alias'][Options['field']] ) {
                label = getField( kv, Options['alias'][Options['field']] );
            }

            if (Labels[label] === undefined) {
                map.push({'label' : label, id : id});
                Labels[label] = map.length-1;  // point to the index where the label is defined
            }
            else {
                if (Labels[label]) { 
                    map[Labels[label]]['id'] = '';
                    console.log(' cleared ' + map[Labels[label]]['label'] + ':' +  map[Labels[label]]['id']); 
                    Labels[label] = '';
                }
            }

            records++;
        }
    }

    html += "</Form>\n";
    html += "</TBODY>\n</TABLE>\n";
    
    if (! records) { 
        html += onEmpty + "\n";
    }
//        html += "<button onclick=\"document.getElementById('NewRecord').val('true'); return false;\">Add New Record</button>\n"; 
//	
    
    if (Options['displayBlock']) { 
        console.log('display to ' + Options['displayBlock'] + ' block');
        $('#' + Options['displayBlock']).html(html); 

        if (useDataTables) { $('#searchData').DataTable() }
     }
     else {
        console.log('no display block ');
     }

    return map;
}

function getField (data, field) {
    var keys = data[0];
    var values = data[1];

    for (i=0; i<keys.length; i++) {
        if (field.match(keys[i]) ) {
            return values[i];
        }
    }
    return;  // not defined ... 
}
function addRow (keys, values, Options, rowClass) {

    var target = Options['target'] || '';
    var setFields = Options['set'] || [];
    var highlight = Options['search'] || '';
    var show      = Options['show'];

    var html = "<TR class= '" + rowClass + "'>\n";

    var headerOnly = 0;  // just display key fields as header if only keys supplied
    if (!values) {
        values = keys;
        headerOnly = 1;
    }

    var setlist = setFields.join('=');
    var id;
    var setvals = [];
    for ( i=0; i<values.length; i++) {
        var v = values[i] || '';
        var k = keys[i];
        v = parseval(k,v);
                
        if (setlist.match(k)) { 
            var qv = encodeURIComponent(v);
            /** Make reference Field clickable to populate the primary element **/
            setvals.push("'" + k + '=' + qv + "'");
            if (Options['alias'] && Options['alias'][k]) {
                /** enables use of alias instead of explicit field name **/
                setvals.push("'" + Options['alias'][k] + '=' + qv + "'");
            }
        }
        var regexp = new RegExp('\b' + k + '\b', 'g');

        if ( show && show.match(k) ) {
            if (k == target) {
                var onclick = "selectItem(<SELECTLINK>); return false; ";
                v = "\n<A HREF='#' onclick=\"" + onclick + "\">" + v + "</A>\n";
            }
            html += "\t<TD>\n\t\t" + v + "\n\t</TD>\n";
        }
    }

    var set = setvals.join(',');

    var html = html.replace(/<SELECTLINK>/gi, "[" + set + "]");
    html += "</TR>\n";

    return html;
}

function subObjects ( data ) {

   var dataType = typeof data;
   if (dataType.match('object')) {
     var values = [];
     var keys   = [];
     for (k in data) {
        var v = data[k];
        v = parseval(k,v);

        values.push(v)
        keys.push(k)
     }
     return [keys, values];
   }
   return;
}

function parseval (k, v) {
    if (k === undefined) { return v }
    if (k.match(/Time$/i)) { 
        if (v) { v = v.slice(0, 19).replace('T', ' ') }
    }
    else if (k.match(/Date$/i)) { 
        if (v) { v = v.slice(0, 10) }
    } 
    return v;  
}

/*** Set Specified Element to Specified Value ***/
function selectItem (setvals) {

    for (var i=0; i<= setvals.length; i++) {
        if (setvals[i] === undefined ) { continue }
        var kv = setvals[i].split('=');
        var id = kv[0];
        var value = kv[1];

        var decoded = decodeURIComponent(value);
        var set = $('#' + id).val(decoded);

/*
        // already accounted for in function above... sets both alias and id ... 
        var alias = Options['alias'];
        if ( alias && alias[id] ) {
            console.log('set ' + id + ' alias: ' + alias[id] + ' to ' + decoded);
            $('#' + alias[id]).val(decoded);
        }
*/
    }

    console.log(setvals)
}

