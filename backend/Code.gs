
/**
 * كود Google Apps Script المطور لصيدليات المصريين
 * الترتيب المطلوب (A-J):
 * A: التاريخ
 * B: الاسم بالكامل
 * C: رقم الموبايل
 * D: العنوان بالتفصيل (النص + رابط الموقع)
 * E: شركة التأمين
 * F: الفرع
 * G: رابط صورة الكارنيه
 * H: رابط صورة الروشتة
 * I: روابط صور البطاقة (الوجه والظهر معاً)
 * J: رقم الروشتة (Serial Number)
 */

var SPREADSHEET_ID = "YOUR_SPREADSHEET_ID_HERE"; // يجب وضع معرف الشيت هنا
var FOLDER_NAME = "روشتات صيدليات المصريين - المرفقات";

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheets()[0];
    
    // إنشاء الرؤوس بالترتيب المطلوب بدقة إذا كانت الصفحة فارغة
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "التاريخ",            // A
        "الاسم بالكامل",       // B
        "رقم الموبايل",        // C
        "العنوان بالتفصيل",     // D
        "شركة التأمين",       // E
        "الفرع",             // F
        "رابط صورة الكارنيه",  // G
        "رابط صورة الروشتة",   // H
        "روابط صور البطاقة",    // I
        "رقم الروشتة",        // J
        "تحليل الذكاء الاصطناعي" // K (إضافي للمساعدة)
      ]);
      sheet.getRange(1, 1, 1, 11).setBackground("#7c3aed").setFontColor("#ffffff").setFontWeight("bold");
    }

    var parentFolder = getOrCreateFolder(FOLDER_NAME);
    var subFolderName = data.serialNumber + " - " + data.fullName;
    var requestFolder = parentFolder.createFolder(subFolderName);
    
    // حفظ الملفات في Google Drive
    var pUrl = data.prescription ? saveFile(data.prescription, requestFolder, "روشتة") : "";
    var cUrl = data.card ? saveFile(data.card, requestFolder, "كارنيه") : "";
    var idFUrl = data.idFront ? saveFile(data.idFront, requestFolder, "وجه_بطاقة") : "";
    var idBUrl = data.idBack ? saveFile(data.idBack, requestFolder, "ظهر_بطاقة") : "";
    
    // معالجة العمود D: دمج العنوان المكتوب مع رابط الموقع
    var fullAddressInfo = data.address;
    if (data.locationUrl) {
      fullAddressInfo += (fullAddressInfo ? "\nرابط الموقع: " : "") + data.locationUrl;
    }
    
    // معالجة العمود I: دمج رابطي وجه وظهر البطاقة
    var idCombinedUrls = "الوجه: " + idFUrl + "\nالظهر: " + idBUrl;
    
    var timestamp = Utilities.formatDate(new Date(), "GMT+2", "yyyy-MM-dd HH:mm:ss");
    
    // إضافة الصف بالترتيب المطلوب (A-J)
    sheet.appendRow([
      timestamp,              // A: التاريخ
      data.fullName,          // B: الاسم
      "'" + data.phone,       // C: الموبايل
      fullAddressInfo,        // D: العنوان بالتفصيل (نص + لينك)
      data.insuranceCompany,  // E: شركة التأمين
      data.branch,            // F: الفرع
      cUrl,                   // G: صورة الكارنيه
      pUrl,                   // H: صورة الروشتة
      idCombinedUrls,         // I: صور البطاقة
      data.serialNumber,      // J: رقم الروشتة
      data.extractedAiData    // K: تحليل AI
    ]);
    
    // ضبط التفاف النص للعنوان والروابط لسهولة القراءة
    sheet.getRange(sheet.getLastRow(), 4).setWrap(true);
    sheet.getRange(sheet.getLastRow(), 9).setWrap(true);
    
    return ContentService.createTextOutput(JSON.stringify({"success": true, "serial": data.serialNumber}))
      .setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({"success": false, "error": error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function saveFile(fileData, folder, prefix) {
  var blob = Utilities.newBlob(Utilities.base64Decode(fileData.base64), fileData.type, prefix + "_" + fileData.name);
  var file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return file.getUrl();
}

function getOrCreateFolder(folderName) {
  var folders = DriveApp.getFoldersByName(folderName);
  return folders.hasNext() ? folders.next() : DriveApp.createFolder(folderName);
}
