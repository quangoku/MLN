export const DIALOGUES = {
  "farmer_intro": {
    "speaker": "Lão Nông Tiên",
    "lines": [
      "Chào người khách lạ! Ta thấy ngươi có vẻ mạnh mẽ lắm.",
      "Làng ta đang thiếu người giúp. Nếu ngươi có thể trồng 5 luống cà rốt, ta sẽ tặng ngươi 20 vàng!",
      "Hãy đến các ô ruộng phía sau làng và nhấn E để trồng."
    ],
    "quest": {
      "id": "farm_carrots",
      "description": "Trồng và thu hoạch 3 luống cà rốt",
      "objective": { "type": "harvest_crop", "crop": "carrot", "count": 3 },
      "reward": { "gold": 20 }
    }
  },
  "villager_elder": {
    "speaker": "Bà Nội Làng",
    "lines": [
      "Ờ... Người khách ơi, nghe nói khu rừng phía tây bắc có cây nấm phát sáng rất đẹp.",
      "Nhưng đừng có đi lúc tối quá, đom đóm đầm lầy trông đáng sợ lắm đấy!"
    ]
  },
  "child_crystal_hint": {
    "speaker": "Bé An",
    "lines": [
      "Chú ơi! Chú ơi! Con thấy những viên tinh thể sáng lắm ở gần hang động!",
      "Mà chúng bay lơ lửng nữa, con sợ không dám lại gần..."
    ]
  },
  "merchant_buy_sell": {
    "speaker": "Hào Phú Lương",
    "lines": [
      "Chào thương khách! Hào Phú Lương đây, buôn bán khắp nơi!",
      "Ta có thể mua bán nông sản, tinh thể và vật phẩm quý. Nhấn I để mở túi đồ nhé!",
      "Tinh thể cyan hiện đang có giá tốt!"
    ],
    "shopId": "main_merchant"
  },
  "guard_rune_hint": {
    "speaker": "Lính Canh Minh",
    "lines": [
      "Dừng lại! Á không... người dân thường thôi.",
      "Ta nghe nói có 3 tảng Đá Cổ Ngữ cần được thắp sáng để mở Cổng Thiên Cầu.",
      "Chúng nằm ở: Rừng Rậm Phía Tây Bắc, Tàn Tích Phía Đông Nam, và... ta quên mất rồi."
    ]
  },
  "scholar_lore": {
    "speaker": "Học Giả Vân",
    "lines": [
      "Thú vị! Người cũng quan tâm đến Cổng Thiên Cầu sao?",
      "Theo cổ thư ghi lại, Cổng Thiên Cầu được xây dựng bởi những pháp sư thời Tiền Cổ.",
      "Chỉ khi ba phong ấn — tương ứng ba nguyên tố — được thắp sáng thì cổng mới mở.",
      "Ta có thể dạy ngươi đọc các ký tự cổ nếu ngươi mang cho ta 5 tinh thể."
    ],
    "quest": {
      "id": "scholar_crystals",
      "description": "Mang 5 tinh thể cho Học Giả Vân",
      "objective": { "type": "collect_crystals", "count": 5 },
      "reward": { "gold": 30, "item": "ancient_scroll" }
    }
  },
  "hunter_quest": {
    "speaker": "Thợ Săn Dũng",
    "lines": [
      "Ê! Người kia! Trông mày có vẻ nhanh nhẹn đấy.",
      "Tao cần người khám phá các khu vực chưa ai đặt chân đến.",
      "Nếu mày khám phá được 5 khu vực mới, tao sẽ trả công xứng đáng!"
    ],
    "quest": {
      "id": "explorer_quest",
      "description": "Khám phá 5 khu vực mới",
      "objective": { "type": "visit_zones", "count": 5 },
      "reward": { "gold": 50 }
    }
  },
  "elder_wisdom": {
    "speaker": "Trưởng Lão Bình",
    "lines": [
      "Hm... Khách lạ từ xa đến.",
      "Ta đã sống ở thị trấn này suốt 70 năm. Mọi thứ đều thay đổi, ngoại trừ ánh trăng.",
      "Hãy cẩn thận khi đến gần Đầm Lầy Sương Mù... Những ai vào đó không phải lúc nào cũng ra được."
    ]
  },
  "guard_temple": {
    "speaker": "Linh Vệ Cổ Đền",
    "lines": [
      "Chào người du hành. Ta được phái đến để bảo vệ Cổng Thiên Cầu.",
      "Nếu ngươi muốn kích hoạt Cổng, hãy thu thập đủ 3 phong ấn Cổ Ngữ trước."
    ]
  },
  "scholar_observatory": {
    "speaker": "Thiên Văn Học Sĩ",
    "lines": [
      "Ah, người leo lên được đây rồi! Tuyệt vời!",
      "Từ đây có thể quan sát toàn bộ vùng đất.",
      "Dải Ngân Hà phía Bắc... Trăng mọc phía Đông Bắc... Và Cổng Thiên Cầu tỏa sáng ở trung tâm.",
      "Đây là thứ bản đồ sao người xưa để lại."
    ]
  },
  "hunter_forest": {
    "speaker": "Liệt Sĩ Rừng",
    "lines": [
      "Shhh... Đừng làm ồn!",
      "Ta đang theo dõi một con thú phát sáng trong rừng này.",
      "Nấm bioluminescent ở đây có thể dùng làm thuốc. Nhưng mà... cũng có thể độc. Khó nói lắm.",
      "Ngươi có thấy tinh thể cyan nào không? Chúng thường nằm gần các nấm đó."
    ]
  },
  "villager_market": {
    "speaker": "Dân Phố Hòa",
    "lines": [
      "Chợ hôm nay đông quá! Cứ ngỡ hôm nay thứ mấy.",
      "Người kia — Thương nhân kim khí — bán dao tốt lắm đấy, nhưng đắt kinh khủng."
    ]
  },
  "merchant_potions": {
    "speaker": "Tiểu Thương Hải",
    "lines": [
      "Thuốc! Thuốc hồi phục! Giá cả phải chăng!",
      "Mua ngay trước khi hết hàng nhé khách ơi!"
    ],
    "shopId": "potion_vendor"
  },
  "villager_gossip": {
    "speaker": "Bà Thị Kim",
    "lines": [
      "Ôi chao, ngươi có nghe nói không?",
      "Đêm qua Cổng Thiên Cầu sáng lên mạnh hơn bao giờ hết!",
      "Người ta bảo có phong ấn vừa được thắp sáng... Mà chẳng biết ai làm."
    ]
  }
};

export default DIALOGUES;

