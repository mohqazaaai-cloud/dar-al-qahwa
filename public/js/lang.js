const TRANSLATIONS = {
  en: {
    home: 'Home', menu: 'Menu', reserve: 'Reserve', gallery: 'Gallery',
    events: 'Events', loyalty: 'Loyalty', login: 'Staff Login', logout: 'Sign out',
    cart: 'Cart', explore_menu: 'Explore the Menu', reserve_table: 'Reserve a Table',
    hero_tag: 'Specialty Coffee · Amman, Jordan',
    hero_title: 'Where every cup<br>tells a <em>story</em>',
    hero_sub: 'Nestled in the heart of Jabal Al-Weibdeh, we source single-origin beans from across the Arab world — roasted with intention, brewed with care.',
    origins: 'Origins', rating: 'Rating', est: 'Est.',
    our_story: 'Our Story', born_title: 'Born in Amman,<br>brewed with <em>passion</em>',
    years_craft: 'Years of craft',
    direct_trade: 'Direct-trade sourcing', direct_trade_desc: 'We visit partner farms annually, paying above fair-trade prices.',
    micro_roastery: 'In-house micro-roastery', micro_roastery_desc: 'Every batch roasted in small quantities right here in Amman.',
    pastry_kitchen: 'Jordanian pastry kitchen', pastry_kitchen_desc: 'Cardamom knots, date tarts, and knafeh croissants — daily.',
    taste_waiting: "A taste of what's waiting", from_menu: 'From our menu',
    view_full_menu: 'View full menu →',
    what_people_say: 'What people say', loved_by: 'Loved by the Amman community',
    find_us: 'Find us', come_visit: 'Come visit us in Weibdeh',
    address: 'Address', hours: 'Hours', reservations_contact: 'Reservations',
    stay_loop: 'Stay in the loop', newsletter_desc: 'New beans, seasonal drinks, and cupping events — delivered to your inbox.',
    subscribe: 'Subscribe', subscribed: 'Subscribed ✓',
    add_to_order: '+', place_order: 'Place Order', placing_order: 'Placing order...',
    your_order: 'Your Order', cart_empty: 'Your cart is empty',
    your_name: 'Your name', table_number: 'Table number (optional)', special_requests: 'Special requests...',
    total: 'Total', jd: 'JD',
    book_spot: 'Book a spot', reserve_title: 'Reserve a Table',
    confirm_reservation: 'Confirm Reservation', confirming: 'Confirming...',
    full_name: 'Full Name', email: 'Email', phone: 'Phone', guests: 'Guests',
    date: 'Date', time: 'Time', special_req_label: 'Special Requests',
    staff_login: 'Staff Login', sign_in: 'Sign In', signing_in: 'Signing in...',
    password: 'Password', default_cred: 'Default: admin@daralqahwa.jo / admin123',
    overview: 'Overview', orders: 'Orders', res_admin: 'Reservations',
    menu_items: 'Menu Items', newsletter_admin: 'Newsletter', staff_users: 'Staff Users',
    loyalty_admin: 'Loyalty Members', events_admin: 'Events', gallery_admin: 'Gallery',
    settings_admin: 'Settings', shifts_admin: 'Staff Shifts',
    crafted_for_you: 'Crafted for you', the_menu: 'The Menu',
    everything_fresh: 'Everything made fresh, in-house, every day.',
  },
  ar: {
    home: 'الرئيسية', menu: 'القائمة', reserve: 'الحجز', gallery: 'معرض الصور',
    events: 'الفعاليات', loyalty: 'برنامج الولاء', login: 'دخول الموظفين', logout: 'تسجيل الخروج',
    cart: 'السلة', explore_menu: 'استكشف القائمة', reserve_table: 'احجز طاولة',
    hero_tag: 'قهوة متخصصة · عمّان، الأردن',
    hero_title: 'كل فنجان يحكي<br><em>حكاية</em>',
    hero_sub: 'في قلب جبل اللويبدة، نستورد حبوب القهوة أحادية المصدر من حول العالم العربي — نحمّصها بعناية، ونصنعها بحب.',
    origins: 'مصدر', rating: 'التقييم', est: 'تأسيس',
    our_story: 'قصتنا', born_title: 'وُلدنا في عمّان،<br>ونُصنع بـ<em>شغف</em>',
    years_craft: 'سنوات من الإتقان',
    direct_trade: 'مصادر مباشرة من المزارع', direct_trade_desc: 'نزور مزارع الشركاء سنويًا ونعطي أسعارًا أعلى من التجارة العادلة.',
    micro_roastery: 'محمصة داخلية', micro_roastery_desc: 'نحمّص كل دفعة بكميات صغيرة هنا في عمّان.',
    pastry_kitchen: 'مطبخ المعجنات الأردنية', pastry_kitchen_desc: 'كنافة كرواسون، وتارت التمر، وعقد الهيل — يوميًا.',
    taste_waiting: 'طعم ما ينتظرك', from_menu: 'من قائمتنا',
    view_full_menu: 'عرض القائمة كاملة →',
    what_people_say: 'ماذا يقولون', loved_by: 'محبوبون في مجتمع عمّان',
    find_us: 'جدنا', come_visit: 'زورونا في الويبدة',
    address: 'العنوان', hours: 'أوقات العمل', reservations_contact: 'الحجوزات',
    stay_loop: 'ابقَ على اطلاع', newsletter_desc: 'حبوب جديدة، مشروبات موسمية، وفعاليات تذوق — مباشرة إلى بريدك.',
    subscribe: 'اشترك', subscribed: 'تم الاشتراك ✓',
    add_to_order: '+', place_order: 'تأكيد الطلب', placing_order: 'جارٍ الإرسال...',
    your_order: 'طلبك', cart_empty: 'سلتك فارغة',
    your_name: 'اسمك', table_number: 'رقم الطاولة (اختياري)', special_requests: 'طلبات خاصة...',
    total: 'الإجمالي', jd: 'دينار',
    book_spot: 'احجز مقعدك', reserve_title: 'احجز طاولة',
    confirm_reservation: 'تأكيد الحجز', confirming: 'جارٍ التأكيد...',
    full_name: 'الاسم الكامل', email: 'البريد الإلكتروني', phone: 'الهاتف', guests: 'عدد الأشخاص',
    date: 'التاريخ', time: 'الوقت', special_req_label: 'طلبات خاصة',
    staff_login: 'دخول الموظفين', sign_in: 'تسجيل الدخول', signing_in: 'جارٍ الدخول...',
    password: 'كلمة المرور', default_cred: 'admin@daralqahwa.jo / admin123',
    overview: 'نظرة عامة', orders: 'الطلبات', res_admin: 'الحجوزات',
    menu_items: 'عناصر القائمة', newsletter_admin: 'النشرة البريدية', staff_users: 'موظفو النظام',
    loyalty_admin: 'أعضاء الولاء', events_admin: 'الفعاليات', gallery_admin: 'معرض الصور',
    settings_admin: 'الإعدادات', shifts_admin: 'ورديات الموظفين',
    crafted_for_you: 'مصنوع لك', the_menu: 'القائمة',
    everything_fresh: 'كل شيء طازج، يوميًا.',
  }
};

const Lang = {
  current: localStorage.getItem('daq_lang') || 'en',
  t(key) { return TRANSLATIONS[this.current][key] || TRANSLATIONS['en'][key] || key; },
  set(lang) {
    this.current = lang;
    localStorage.setItem('daq_lang', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    Router.resolve();
  },
  init() {
    const saved = localStorage.getItem('daq_lang') || 'en';
    this.current = saved;
    document.documentElement.lang = saved;
    document.documentElement.dir = saved === 'ar' ? 'rtl' : 'ltr';
  }
};
