/**
 * Lớp Markdown — dùng để quản lý và hiển thị nội dung markdown trong ứng dụng.
 *
 * Nó có nhiệm vụ nhận dữ liệu từ props (chứa nội dung markdown)
 * và cung cấp các phương thức tiện ích để truy cập hoặc khởi tạo.
 */
export default class Markdown {
  // ======================================
  // KHỞI TẠO
  // ======================================

  /**
   * Hàm khởi tạo lớp Markdown.
   *
   * @param {Object} params - Tham số khởi tạo.
   * @param {Object} params.props - Thuộc tính (props) được truyền từ component cha, có thể chứa nội dung markdown.
   * @param {import('vue').SetupContext} params.componentContext - Ngữ cảnh setup của Vue (để emit event, v.v).
   */
  constructor({ props, componentContext }) {
    /**
     * Lưu trữ props (các dữ liệu reactivity từ Vue).
     * @type {Object}
     */
    this.props = props

    /**
     * Lưu trữ context của Vue (emit, slots, attrs, ...).
     * @type {import('vue').SetupContext}
     */
    this.componentContext = componentContext
  }

  // ======================================
  // PHƯƠNG THỨC KHỞI TẠO TỪNG INSTANCE
  // ======================================

  /**
   * Tạo nhanh một instance mới của lớp Markdown.
   *
   * Thay vì gọi `new Markdown(...)`, ta có thể gọi `Markdown.create(...)`.
   *
   * @param {Object} params - Tham số truyền vào hàm tạo.
   * @param {Object} params.props - Thuộc tính (props) của component Vue.
   * @param {import('vue').SetupContext} params.componentContext - Ngữ cảnh setup của Vue.
   * @returns {Markdown} Trả về một instance mới của Markdown.
   */
  static create({ props, componentContext }) {
    return new Markdown({ props, componentContext })
  }

  // ======================================
  // THIẾT LẬP VÀ KHỞI CHẠY
  // ======================================

  /**
   * Gọi khi cần khởi tạo component hoặc setup dữ liệu nội bộ.
   *
   * Có thể mở rộng để chạy thêm logic nếu cần.
   *
   * @returns {this} Trả về chính instance hiện tại (để chain method).
   */
  setupComponent() {
    // Ở đây có thể thêm các thao tác khởi tạo nếu cần
    return this
  }

  // ======================================
  // CÁC GETTER / LOGIC TRUY XUẤT
  // ======================================

  /**
   * Lấy nội dung markdown từ props.
   *
   * @returns {string} Trả về chuỗi markdown (rỗng nếu không có nội dung).
   */
  get markdownContent() {
    return this.props?.content ?? ''
  }
}
