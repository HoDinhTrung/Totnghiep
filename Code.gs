/**
 * GOOGLE APPS SCRIPT BACKEND FOR DIGITAL GRADUATION INVITATION
 * 
 * Hướng dẫn thiết lập:
 * 1. Mở bảng tính Google Sheets của bạn.
 * 2. Vào Tiện ích mở rộng -> Apps Script (Extensions -> Apps Script).
 * 3. Xóa mọi mã hiện có và dán mã nguồn dưới đây vào.
 * 4. Nhấn Save (biểu tượng lưu).
 * 5. Nhấn Deploy -> Deploy mới (New deployment).
 * 6. Chọn loại cấu hình là "Ứng dụng web" (Web app).
 * 7. Phần "Người có quyền truy cập" (Who has access), chọn "Bất kỳ ai" (Anyone) - Rất quan trọng!
 * 8. Nhấn Deploy, cấp quyền truy cập bảng tính cho script nếu được yêu cầu.
 * 9. Sao chép URL ứng dụng web nhận được và dán vào biến `GAS_API_URL` ở đầu script trong `index.html`.
 */

// Tên của trang tính chứa dữ liệu khách mời
const SHEET_NAME = "Guests";

/**
 * Xử lý yêu cầu GET: Lấy thông tin khách mời hoặc Cập nhật RSVP
 */
function doGet(e) {
  try {
    const id = e.parameter.id;
    const action = e.parameter.action;
    const status = e.parameter.status;

    if (!id) {
      return createJsonResponse({ error: "Missing 'id' parameter" });
    }

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    if (!sheet) {
      return createJsonResponse({ error: "Sheet '" + SHEET_NAME + "' not found" });
    }

    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();
    
    // Tìm tiêu đề cột để xác định chỉ số
    const headers = values[0];
    const colIdIdx = headers.indexOf("id");
    const colNameIdx = headers.indexOf("guestName");
    const colMessageIdx = headers.indexOf("customMessage");
    const colCoGuestsIdx = headers.indexOf("coGuests");
    const colRsvpIdx = headers.indexOf("rsvpStatus");

    if (colIdIdx === -1 || colNameIdx === -1 || colMessageIdx === -1 || colCoGuestsIdx === -1 || colRsvpIdx === -1) {
      return createJsonResponse({ error: "Invalid sheet structure. Headers must include: id, guestName, customMessage, coGuests, rsvpStatus" });
    }

    // Tìm dòng tương ứng với id khách mời
    let rowIndex = -1;
    for (let i = 1; i < values.length; i++) {
      if (String(values[i][colIdIdx]).trim() === String(id).trim()) {
        rowIndex = i + 1; // 1-indexed row number
        break;
      }
    }

    // Trường hợp 1: Cập nhật RSVP (action = rsvp)
    if (action === "rsvp" && status) {
      if (rowIndex === -1) {
        return createJsonResponse({ error: "Guest ID '" + id + "' not found to update RSVP" });
      }

      // Cập nhật trạng thái RSVP vào cột tương ứng
      sheet.getCell(rowIndex, colRsvpIdx + 1).setValue(status);
      
      // Thêm log thời gian cập nhật vào cột cuối cùng nếu muốn (tùy chọn)
      const colTimestampIdx = headers.indexOf("rsvpTimestamp");
      if (colTimestampIdx !== -1) {
        sheet.getCell(rowIndex, colTimestampIdx + 1).setValue(new Date());
      }

      return createJsonResponse({ status: "success", message: "RSVP updated to " + status });
    }

    // Trường hợp 2: Lấy thông tin khách mời
    if (rowIndex === -1) {
      return createJsonResponse({ error: "Guest not found" });
    }

    const rowData = values[rowIndex - 1];
    
    // Phân tích danh sách người đi cùng (coGuests) phân tách bởi dấu phẩy
    const rawCoGuests = String(rowData[colCoGuestsIdx]).trim();
    let coGuestsList = [];
    if (rawCoGuests !== "" && rawCoGuests !== "-" && rawCoGuests !== "null") {
      coGuestsList = rawCoGuests.split(",").map(function(item) {
        return item.trim();
      }).filter(function(item) {
        return item !== "";
      });
    }

    const guestInfo = {
      id: String(rowData[colIdIdx]).trim(),
      guestName: String(rowData[colNameIdx]).trim(),
      customMessage: String(rowData[colMessageIdx]).trim(),
      coGuests: coGuestsList,
      rsvpStatus: String(rowData[colRsvpIdx]).trim() || "pending"
    };

    return createJsonResponse(guestInfo);

  } catch (error) {
    return createJsonResponse({ error: error.toString() });
  }
}

/**
 * Xử lý yêu cầu POST (dành cho cập nhật RSVP bảo mật hoặc RESTful)
 */
function doPost(e) {
  // Chuyển tiếp sang doGet để xử lý đơn giản hóa, tránh các hạn chế CORS phức tạp
  return doGet(e);
}

/**
 * Hàm phụ trợ tạo phản hồi dạng JSON hỗ trợ CORS
 */
function createJsonResponse(data) {
  const jsonString = JSON.stringify(data);
  return ContentService.createTextOutput(jsonString)
    .setMimeType(ContentService.MimeType.JSON);
}
