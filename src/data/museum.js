import { CHAPTER_1 } from './chapter1.js'
import { CHAPTER_2 } from './chapter2.js'
import { CHAPTER_3 } from './chapter3.js'

// Thứ tự phòng từ tây sang đông. Kích thước phòng trưng bày tự tính theo số hiện vật
// (xem world/layout.js), nên thêm/bớt hiện vật chỉ cần sửa file chapterX.js.
export const MUSEUM = [
  {
    id: 'lobby',
    kind: 'lobby',
    name: 'Sảnh chính',
    short: 'Sảnh',
    theme: 'lobby',
    width: 12,
    visitors: 2,
    welcome: {
      title: 'Chào mừng đến PhiloVerse',
      body: [
        'Bảo tàng tương tác của học phần Triết học Mác-Lênin (MLN111).',
        'Ba phòng trưng bày ở phía đông ứng với ba chương của giáo trình. Đi qua cửa để sang phòng tiếp theo.',
        'Quyển sách lơ lửng là định nghĩa, lý thuyết. Viên đá quý phát sáng là kết luận, ý nghĩa.',
        'Rê chuột để đọc, nhấp để ghim bảng thông tin. Hãy khám phá hết mọi hiện vật!',
      ],
    },
  },
  {
    id: 'ch1',
    chapter: 1,
    name: 'Phòng 1',
    short: 'C1',
    title: 'Khái luận về triết học và triết học Mác-Lênin',
    theme: 'ch1',
    visitors: 3,
    ...CHAPTER_1,
  },
  {
    id: 'ch2',
    chapter: 2,
    name: 'Phòng 2',
    short: 'C2',
    title: 'Chủ nghĩa duy vật biện chứng',
    theme: 'ch2',
    visitors: 4,
    ...CHAPTER_2,
  },
  {
    id: 'ch3',
    chapter: 3,
    name: 'Phòng 3',
    short: 'C3',
    title: 'Chủ nghĩa duy vật lịch sử',
    theme: 'ch3',
    visitors: 4,
    ...CHAPTER_3,
  },
]
