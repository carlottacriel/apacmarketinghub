// APAC Marketing Hub — Google Apps Script API
// Deploy as Web App: Execute as Me, Who has access: Anyone (not "Anyone within Shopify")
// This makes the endpoint publicly accessible so the Quicksite can fetch it without auth.

var SHEET_ID = '1iXiwUD4TMb-37LsE-rTgfPsUMQ0BOa5bexxMNi8HamA';

/** Tab title for the live marketing calendar (must match Source of Truth sheet tab). */
var TACTICS_TAB_NAME = 'NEW_Calendar_TEMPLATE';

function findSheetByName(ss, name) {
  var sheet = ss.getSheetByName(name);
  if (sheet) return sheet;
  var target = String(name).trim();
  var sheets = ss.getSheets();
  for (var i = 0; i < sheets.length; i++) {
    if (String(sheets[i].getName()).trim() === target) return sheets[i];
  }
  return null;
}

function doGet(e) {
  var action    = (e && e.parameter && e.parameter.action) ? e.parameter.action : '';
  var sheetName = (e && e.parameter && e.parameter.sheet)  ? e.parameter.sheet  : '';

  var data;

  if (action === 'orgchart') {
    data = getSheetData(SHEET_ID, 'Org chart');
  } else if (action === 'tactics') {
    data = getSheetData(SHEET_ID, TACTICS_TAB_NAME);
  } else if (action === 'cms' && sheetName) {
    data = getSheetData(SHEET_ID, sheetName);
  } else {
    data = { error: 'Use ?action=orgchart or ?action=tactics or ?action=cms&sheet=TABNAME' };
  }

  var output = ContentService
    .createTextOutput(JSON.stringify({ ok: true, data: data }))
    .setMimeType(ContentService.MimeType.JSON);

  return output;
}

function getSheetData(spreadsheetId, sheetName) {
  try {
    var ss    = SpreadsheetApp.openById(spreadsheetId);
    var sheet = findSheetByName(ss, sheetName);

    if (!sheet) {
      return { error: 'Tab not found: ' + sheetName, rows: [] };
    }

    var values = sheet.getDataRange().getValues();
    if (values.length < 2) {
      return { sheetName: sheetName, rows: [] };
    }

    var headers = [];
    for (var h = 0; h < values[0].length; h++) {
      headers.push(String(values[0][h]).trim());
    }

    var rows = [];
    for (var i = 1; i < values.length; i++) {
      var row     = values[i];
      var hasData = false;
      for (var c = 0; c < row.length; c++) {
        if (row[c] !== '' && row[c] !== null) { hasData = true; break; }
      }
      if (!hasData) continue;

      var obj = {};
      for (var j = 0; j < headers.length; j++) {
        var val = row[j];
        if (val instanceof Date) {
          obj[headers[j]] = val.toISOString().split('T')[0];
        } else {
          obj[headers[j]] = (val !== null && val !== undefined) ? String(val).trim() : '';
        }
      }
      rows.push(obj);
    }

    return { sheetName: sheetName, rows: rows };

  } catch (err) {
    return { error: err.message, rows: [] };
  }
}
