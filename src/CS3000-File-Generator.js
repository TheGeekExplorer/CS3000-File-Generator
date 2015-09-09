/**
 * Scanner File Generator by Mark Greenall
 * 
 * Generates a text file of scanned barcodes with type digits.
 *
 * This generator creates a file which mimicks one from a CS3000 scanner.
 */

var ScannerList = "";
var LineCount = 0;
var FileVersion = 0;
var InvalidBarcodesList = [];


// Main function
function BuildScannerFile () {
    var FormList = document.getElementById('FormList');
    var DocBody = document.body;
    
    // Clear Invalid Barcode List
    InvalidBarcodesList = [];
    var htmlInvalidBarcodesList = document.getElementById("InvalidBarcodeList");
    htmlInvalidBarcodesList.style.display = "none";
    
    // Split list by lines into array
    var csvList = FormList.value.split("\n");
    
    // Set i
    var i = 0;
    var ScannerFile = "";
    
    // Run through list and build file
    csvList.forEach(BuildLine);
    
    // If 750 then create file and wipe list
    if (LineCount > 0) {
        PromptDownload(ScannerList, FileVersion);
        ScannerList = "";
        LineCount = 0;
        FileVersion = 0;
    }
}


// Builds the product line
function BuildLine (gtin, index, array) {
    
    // Check whether is present and a number
    if (gtin == "undefined" || isNaN(gtin) || gtin == null || gtin == "")
        return;
    
    // If lenght is 11 then prefix with "0"
    if (gtin.length == 11)
        gtin = "0" + gtin;
    
    // Returns Barcode TypeDigit (for CS3000), length of GTIN, and Check Digit for checking
    var gtinTypeDigit = BarcodeType(String(gtin));
    
    // If no code returned then Add to Invalid List
    if (!gtinTypeDigit) {
        AddInvalidBarcodeToList(gtin, "Invalid Length");
        return false;
    }
    
    // Check that barcode has valid Check Digit
    if (!CheckGTIN(gtin)) {
        AddInvalidBarcodeToList(gtin, "Invalid Check Digit");  // ADD BARCODE TO INVALID BARCODE LIST
        return false;
    }
    
    // All is well, build the scannerfile line...
    ScannerList += "01/01/2015,00:00:01,";
    ScannerList += gtinTypeDigit;
    ScannerList += ",";
    ScannerList += gtin;
    ScannerList += "\r\n";
    
    // Increment LineCount
    LineCount++;
    
    // If 750 then create file and wipe list
    if (LineCount == 600) {
        LineCount = 0;
        PromptDownload(ScannerList, FileVersion);
        FileVersion++;
        ScannerList = "";
    }
}


// Translate barcode into barcode type code
function BarcodeType (barcode) {
    switch (barcode.length) {
    
        case 8:
            return "0A";
            break;
            
        case 12:
            return "08";
            break;
            
        case 13:
            return "0B";
            break;
        
        case 14:
            return "06";
            break;
            
        default:
            return false;
            break;
    }
    
    // Not matched, return false
    return false;
}


// Check length of barcode for validity
function CheckGTIN (gtin) {

    // Check length of barcode for validity
    if (!CheckBasics(gtin))
        return false;

    // Define fixed variables 
    var CheckDigitArray = [];
    var gtinMaths = [3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3];
    var modifier = 17 - (gtin.length - 1); // Gets the position to place first digit in array
    var gtinCheckDigit = gtin.slice(-1);   // Get provided check digit
    var BarcodeArray = gtin.split("");     // Split barcode at each digit into array
    var gtinLength = gtin.length;
    var tmpCheckDigit = 0;
    var tmpCheckSum = 0;
    var tmpMath = 0;
    
    // Run through and put digits into multiplication table
    for (i=0; i < (gtinLength - 1); i++) {
        CheckDigitArray[modifier + i] = BarcodeArray[i];  // Add barcode digits to Multiplication Table
    }
    
    // Calculate "Sum" of barcode digits
    for (i=modifier; i < 17; i++) {
        tmpCheckSum += (CheckDigitArray[i] * gtinMaths[i]);
    }
        
    // Difference from Rounded-Up-To-Nearest-10 - Fianl Check Digit Calculation
    tmpCheckDigit = (Math.ceil(tmpCheckSum / 10) * 10) - parseInt(tmpCheckSum);
    
    // Check if last digit is same as calculated check digit
    if (gtin.slice(-1) == tmpCheckDigit)
        return true;
    return false;
}

// Checks the validity of the input - is it
// the right length (8, 12, 13, 14), and is
// a numeric value
function CheckBasics (gtin) {
    // Check length is ok
    if (gtin.length != 8 && gtin.length != 12 && gtin.length != 13 && gtin.length != 14)
        return false;
    
    // Check whether is a number
    var m = gtin.match(/\d+/);
    if (isNaN(m[0]))
        return false;
    
    // Is valid, return true
    return true;
}


// Adds barcode to invalid barcode list
function AddInvalidBarcodeToList (gtin, Message) {

    // Push Barcode and Reason Code onto array
    InvalidBarcodesList.push(" " + gtin + " (<small>" + Message + "</small>)");
    
    // Display list on screen
    var htmlInvalidBarcodesList = document.getElementById("InvalidBarcodeList");
    htmlInvalidBarcodesList.style.display = "block";
    
    // Display barcodes to the user
    htmlInvalidBarcodesList.innerHTML = "<b>These barcodes have not been included in the scanner file because they are invalid:</b><br />" + InvalidBarcodesList;
}


// Creates a virtual download file to download
function PromptDownload (file, ver) {
    
    var filename = "ScannerFile-" + ver + ".txt";
    
    //window.open('data:text/plain;charset=ISO-8859-1,' + encodeURIComponent(file), ver);
    //window.open('data:image/jpeg,' + encodeURIComponent(file), ver);
    
    /** **/
    var pom = document.createElement('a');
    pom.setAttribute('href', 'data:text/css;charset=utf-8,' + encodeURIComponent(file));
    pom.setAttribute('download', filename);

    if (document.createEvent) {
        var event = document.createEvent('MouseEvents');
        event.initEvent('click', true, true);
        pom.dispatchEvent(event);
    }
    else {
       pom.click();
    }
    /** **/
}



// Production steps of ECMA-262, Edition 5, 15.4.4.18
// Reference: http://es5.github.io/#x15.4.4.18
if (!Array.prototype.forEach) {

  Array.prototype.forEach = function(callback, thisArg) {

    var T, k;

    if (this == null) {
      throw new TypeError(' this is null or not defined');
    }

    // 1. Let O be the result of calling ToObject passing the |this| value as the argument.
    var O = Object(this);

    // 2. Let lenValue be the result of calling the Get internal method of O with the argument "length".
    // 3. Let len be ToUint32(lenValue).
    var len = O.length >>> 0;

    // 4. If IsCallable(callback) is false, throw a TypeError exception.
    // See: http://es5.github.com/#x9.11
    if (typeof callback !== "function") {
      throw new TypeError(callback + ' is not a function');
    }

    // 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
    if (arguments.length > 1) {
      T = thisArg;
    }

    // 6. Let k be 0
    k = 0;

    // 7. Repeat, while k < len
    while (k < len) {

      var kValue;

      // a. Let Pk be ToString(k).
      //   This is implicit for LHS operands of the in operator
      // b. Let kPresent be the result of calling the HasProperty internal method of O with argument Pk.
      //   This step can be combined with c
      // c. If kPresent is true, then
      if (k in O) {

        // i. Let kValue be the result of calling the Get internal method of O with argument Pk.
        kValue = O[k];

        // ii. Call the Call internal method of callback with T as the this value and
        // argument list containing kValue, k, and O.
        callback.call(T, kValue, k, O);
      }
      // d. Increase k by 1.
      k++;
    }
    // 8. return undefined
  };
}
