# Hướng Dẫn Cấu Hình Google Sheets & Google Apps Script API

Tài liệu này hướng dẫn bạn cách thiết lập cơ sở dữ liệu trên Google Sheets và triển khai Google Apps Script làm API backend để phục vụ trang web thiệp mời tốt nghiệp động của **Hồ Đình Trung**.

---

## BƯỚC 1: CẤU TRÚC BẢNG TÍNH GOOGLE SHEETS

1. Tạo một trang tính Google Sheets mới.
2. Đổi tên trang tính (Sheet Name) ở góc dưới cùng bên trái thành: `Guests`.
3. Đặt các tiêu đề cột tại **Hàng đầu tiên (Hàng 1)** chính xác theo cấu trúc dưới đây (viết hoa thường chính xác):

| Cột A | Cột B | Cột C | Cột D | Cột E | Cột F (Tùy chọn) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **id** | **guestName** | **customMessage** | **coGuests** | **rsvpStatus** | **rsvpTimestamp** |

### Giải thích các trường dữ liệu:
* **`id`**: Mã định danh (slug) viết liền không dấu ngăn cách bởi dấu gạch ngang (ví dụ: `nam-nguyen`, `an-tran`). Mã này sẽ xuất hiện trên URL của thiệp mời: `?id=nam-nguyen`.
* **`guestName`**: Tên hiển thị đầy đủ của khách mời (ví dụ: `Nguyễn Văn Nam`).
* **`customMessage`**: Lời nhắn gửi cá nhân hóa mà Trung muốn gửi riêng cho người bạn đó.
* **`coGuests`**: Danh sách những người bạn chung đi kèm, ngăn cách nhau bằng dấu phẩy `,` (ví dụ: `Trần Văn Bình, Phạm Văn Cường`). Nếu không có ai đi cùng, hãy để trống hoặc điền `-`.
* **`rsvpStatus`**: Trạng thái phản hồi của khách, mặc định để `pending`. Khi khách bấm xác nhận trên web, Apps Script sẽ tự động cập nhật cột này thành `confirmed` (Đồng ý) hoặc `declined` (Từ chối).
* **`rsvpTimestamp`**: Cột ghi nhận thời gian tự động khi khách hàng thực hiện gửi RSVP từ trình duyệt.

### Dữ liệu mẫu kiểm thử:
Hãy nhập thử dòng dữ liệu sau vào bảng tính để kiểm tra:
* **id**: `nam-nguyen`
* **guestName**: `Nguyễn Văn Nam`
* **customMessage**: `Sau một hành trình dài tại giảng đường NEU, Trung cuối cùng cũng đã đi đến một cột mốc đặc biệt. Rất mong Nam có thể dành chút thời gian đến chung vui cùng Trung trong ngày nhận bằng!`
* **coGuests**: `Trần Văn Bình, Phạm Văn Cường, Lê Văn Dương`
* **rsvpStatus**: `pending`

---

## BƯỚC 2: TRIỂN KHAI GOOGLE APPS SCRIPT API

1. Trên thanh công cụ Google Sheets, nhấp vào **Tiện ích mở rộng** (Extensions) -> **Apps Script**.
2. Một dự án Apps Script mới sẽ mở ra. Xóa tất cả các mã mẫu mặc định trong file `Mã.gs` (hoặc `Code.gs`).
3. Mở file [Code.gs](file:///c:/Users/default.LAPTOP-6AU7HRGH/Desktop/Totnghiep/Code.gs) trong thư mục dự án này, copy toàn bộ nội dung mã nguồn và dán vào Apps Script.
4. Nhấp vào nút **Lưu dự án** (biểu tượng đĩa mềm ở trên cùng).
5. Nhấp vào **Deploy** (Triển khai) -> **Deploy mới** (New deployment).
6. Ở cửa sổ hiện ra, nhấp vào biểu tượng bánh răng bên cạnh "Chọn loại triển khai" (Select type) và chọn **Ứng dụng web** (Web app).
7. Thiết lập thông số cấu hình triển khai như sau:
   * **Mô tả** (Description): `API Thiep Moi Tot Nghiep v1`
   * **Thực thi dưới danh nghĩa** (Execute as): Chọn **Tôi** (Me - địa chỉ email của bạn).
   * **Người có quyền truy cập** (Who has access): Chọn **Bất kỳ ai** (Anyone). 
     > *LƯU Ý QUAN TRỌNG: Bạn bắt buộc phải chọn "Bất kỳ ai" (Anyone) để trang web của bạn có thể truy xuất dữ liệu từ trình duyệt của khách mà không yêu cầu họ đăng nhập tài khoản Google.*
8. Nhấp vào **Deploy** (Triển khai).
9. Nếu đây là lần đầu tiên chạy script, Google sẽ hiển thị một cửa sổ yêu cầu cấp quyền. Nhấp vào **Ủy quyền truy cập** (Authorize access) -> Chọn tài khoản Google của bạn -> Nhấp vào **Nâng cao** (Advanced) -> Chọn **Đi tới dự án (không an toàn)** (Go to ... (unsafe)) -> Nhấp **Cho phép** (Allow).
10. Sau khi triển khai thành công, Google sẽ cung cấp cho bạn một **URL Ứng dụng web** (Web App URL) có định dạng tương tự như:
    `https://script.google.com/macros/s/AKfycb.../exec`
11. Sao chép URL này lại.

---

## BƯỚC 3: LIÊN KẾT API VÀO TRANG FRONTEND

1. Mở file [index.html](file:///c:/Users/default.LAPTOP-6AU7HRGH/Desktop/Totnghiep/index.html).
2. Tìm dòng code số **605** ở đầu thẻ `<script>`:
   ```javascript
   // ================= CONFIGURATION =================
   // Đường dẫn API Web App của Google Apps Script. 
   // Khi cấu hình thành công, dán URL vào đây.
   const GAS_API_URL = ""; 
   ```
3. Dán URL Ứng dụng web bạn vừa sao chép ở Bước 2 vào giữa hai dấu nháy kép. Ví dụ:
   ```javascript
   const GAS_API_URL = "https://script.google.com/macros/s/AKfycbxyz.../exec"; 
   ```
4. Lưu file `index.html`.

---

## BƯỚC 4: THỬ NGHIỆM VÀ PHÂN PHỐI LIÊN KẾT

1. Tải trang web lên máy chủ lưu trữ (GitHub Pages, Vercel, Netlify hoặc chạy cục bộ).
2. Truy cập thử nghiệm bằng các đường dẫn chứa tham số định danh:
   * Bản mặc định (không có id hoặc id không tồn tại): `http://ten-mien-cua-ban.com/` (Sẽ hiển thị mặc định gửi "Bạn Hiền").
   * Bản cá nhân hóa của Nam: `http://ten-mien-cua-ban.com/?id=nam-nguyen`.
3. Kiểm tra tính năng RSVP:
   * Nhấp chọn **CÓ, TÔI SẼ ĐẾN!** trên giao diện thiệp của Nam.
   * Xem hiệu ứng pháo hoa và thông báo xác nhận.
   * Quay lại Google Sheets của bạn để kiểm tra, cột `rsvpStatus` của dòng `nam-nguyen` sẽ tự động chuyển từ `pending` sang `confirmed` và cột `rsvpTimestamp` hiển thị thời gian xác nhận thực tế.
