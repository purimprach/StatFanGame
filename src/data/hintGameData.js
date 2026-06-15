export const hintCategories = [
  {
    id: 'student-1',
    name: 'นิสิต 1',
    icon: '🎓',
    hints: [
      'การบ้าน',
      'คลัง',
      'เก่งคำนวณ',
      '100 เต็ม',
      'พี่',
    ],
    answer: 'พี่เสี่ย',
  },
  {
    id: 'student-2',
    name: 'นิสิต 2',
    icon: '🎓',
    hints: [
      'ชมรม',
      'บาสเกตบอล',
      'สัญญา',
      'เพลง',
      'BIT',
    ],
    answer: 'ก้อย มนัญชยา มีพืชน์ ประธานชมรม BanShi',
  },
  {
    id: 'teacher-1',
    name: 'อาจารย์ 1',
    icon: '👨‍🏫',
    hints: [
      'เคยเรียนเมืองนอก',
      'AI',
      'ชอบสัตว์',
      'จบคณะอื่น',
      'สะพายเป้',
    ],
    answer: 'ศ.ดร.วธนน์ วิริยสิทธาวัฒน์',
  },
  {
    id: 'teacher-2',
    name: 'อาจารย์ 2',
    icon: '👩‍🏫',
    hints: [
      'ผู้หญิง',
      'ใส่แว่น',
      'STAT#18',
      'หัวหน้าหลักสูตร',
      'เทคโนโลยีสารสนเทศ',
    ],
    answer: 'รศ. ดร.อัษฎาพร ทรัพย์สมบูรณ์',
  },
  {
    id: 'place-1',
    name: 'สถานที่ 1',
    icon: '📍',
    hints: [
      'บันไดวน',
      'ใช้ QR Code',
      '2 ชั้น',
      'ไม่ติดดิน',
      'เงียบ',
    ],
    answer: 'เลานจ์บน',
  },
  {
    id: 'place-2',
    name: 'สถานที่ 2',
    icon: '📍',
    hints: [
      'เย็น',
      'อาการป่วย',
      'จอดรถ',
      'เชื่อม',
      'อาหารและขนม',
    ],
    answer: 'จามจุรีแสควร์',
  },
  {
    id: 'other-1',
    name: 'อื่นๆ 1',
    icon: '✨',
    hints: [
      'ผ่าน 60',
      '0 หน่วยกิต',
      'ข้อสอบกา',
      'เรียนปี 1',
      'สอนหลายท่าน',
    ],
    answer: 'BUS FOUND 2602122',
  },
  {
    id: 'other-2',
    name: 'อื่นๆ 2',
    icon: '✨',
    hints: [
      'คนเยอะ',
      'ครั้งแรก',
      'พี่รหัส',
      'เฟรชชี่',
      'วันสำคัญ',
    ],
    answer: 'STAT DAY',
  },
]

export function getCategoryById(id) {
  return hintCategories.find((category) => category.id === id)
}
