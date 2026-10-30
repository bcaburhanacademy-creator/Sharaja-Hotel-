/**
 * Seed Menu Data for Sharjah Hotel Yaru
 * 10 Categories, each with at least 5 delicious items with EN, UR, PS translations,
 * prices in PKR, and high-quality photography.
 */
import { 
  collection, 
  getDocs, 
  writeBatch, 
  doc, 
  serverTimestamp 
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";
import { db, handleFirestoreError, OperationType } from "./firebase-config.js";

export const CATEGORIES = [
  { id: "breakfast", nameEn: "Breakfast", nameUr: "ناشتہ", namePs: "سباناری" },
  { id: "bbq", nameEn: "BBQ", nameUr: "باربی کیو", namePs: "کباب او تکه" },
  { id: "karahi", nameEn: "Karahi", nameUr: "کڑاہی", namePs: "کراهي" },
  { id: "main-course", nameEn: "Pakistani Main Course", nameUr: "پاکستانی سالن", namePs: "اصلي خواړه" },
  { id: "rice-biryani", nameEn: "Rice & Biryani", nameUr: "بریانی اور چاول", namePs: "وریجې او بریاني" },
  { id: "chinese", nameEn: "Chinese Food", nameUr: "چائنیز فوڈ", namePs: "چینايي خواړه" },
  { id: "fast-food", nameEn: "Fast Food", nameUr: "فاسٹ فوڈ", namePs: "فاسټ فوډ" },
  { id: "naan-roti", nameEn: "Naan & Roti", nameUr: "نان اور روٹی", namePs: "ډوډۍ او نان" },
  { id: "drinks", nameEn: "Drinks & Beverages", nameUr: "مشروبات اور چائے", namePs: "څښاک او چای" },
  { id: "desserts", nameEn: "Desserts & Sweets", nameUr: "میٹھے اور میٹھی ڈشز", namePs: "خواږه او حلواګانې" }
];

export const INITIAL_MENU_ITEMS = [
  // 1. BREAKFAST
  {
    id: "bf-1",
    nameEn: "Anda Paratha",
    nameUr: "انڈا پراٹھا",
    namePs: "هګۍ او پراټه",
    descriptionEn: "Crisp flaky ghee paratha served with spiced sunny-side or masala fried egg.",
    descriptionUr: "خستہ اور لذیذ گھی والا پراٹھا گرم گرم مصالحہ دار تلے ہوئے انڈے کے ساتھ۔",
    descriptionPs: "کرکره او غوړ پراټه د مسالې سره پخې شوې هګۍ سره.",
    price: 250,
    category: "breakfast",
    image: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=700&q=80",
    available: true
  },
  {
    id: "bf-2",
    nameEn: "Lahori Chana Plate",
    nameUr: "لاہوری چنے",
    namePs: "لاہوری چڼې",
    descriptionEn: "Tender chickpeas simmered in aromatic gravy and house-ground traditional spices.",
    descriptionUr: "دھنیے اور زیرے کی خوشبو دار تری میں تیار شدہ ذائقہ دار چنے۔",
    descriptionPs: "په دودیزو مسالو کې پخې شوې خوندورې سپینې چڼې.",
    price: 200,
    category: "breakfast",
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=700&q=80",
    available: true
  },
  {
    id: "bf-3",
    nameEn: "Halwa Puri Thali",
    nameUr: "حلوا پوری",
    namePs: "حلوا او پوری",
    descriptionEn: "Two piping hot puffed puris, sweet semolina halwa, spicy chana, and tangy pickle.",
    descriptionUr: "دو گرم پھولی ہوئی پوریاں، دیسی سوجی کا حلوہ، چٹپٹے چنے اور اچار۔",
    descriptionPs: "دوه ګرمې پوریانې، خواږه حلوه، مساله‌دارې چڼې او اچار.",
    price: 350,
    category: "breakfast",
    image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=700&q=80",
    available: true
  },
  {
    id: "bf-4",
    nameEn: "Desi Cheese Omelette",
    nameUr: "دیسی آملیٹ",
    namePs: "دودیز آملیټ",
    descriptionEn: "Whisked fresh farm eggs with green chilies, onions, coriander, and light seasoning.",
    descriptionUr: "سبز مرچ، پیاز اور تازہ دھنیا سے بھرا ہوا روایتی خستہ آملیٹ۔",
    descriptionPs: "د شنه مرچکو، پیازو او تازه بوټو سره جوړ شوی خوندور آملیټ.",
    price: 180,
    category: "breakfast",
    image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=700&q=80",
    available: true
  },
  {
    id: "bf-5",
    nameEn: "Special Karak Doodh Patti Tea",
    nameUr: "خاص کڑک دودھ پتی چائے",
    namePs: "ځانګړی کټ چای",
    descriptionEn: "Simmered rich milk tea brewed with crushed green cardamom and robust tea leaves.",
    descriptionUr: "الائچی اور خالص بھینس کے دودھ کی کڑک اور خوشبو دار دودھ پتی چائے۔",
    descriptionPs: "په غلیظو شیدو او شنه لاچي کې پخ شوی خوشبو داره کټ چای.",
    price: 100,
    category: "breakfast",
    image: "https://images.unsplash.com/photo-1561336313-0bd5e0b27ec8?auto=format&fit=crop&w=700&q=80",
    available: true
  },

  // 2. BBQ
  {
    id: "bbq-1",
    nameEn: "Chicken Tikka (Chest / Leg)",
    nameUr: "چکن تکہ پیس",
    namePs: "د چرګ تکه",
    descriptionEn: "Succulent quarter chicken marinated in Balochi herbs and char-grilled over open coals.",
    descriptionUr: "کوئلوں پر تیار کردہ مصالحہ دار اور رسیلا چکن تکہ۔",
    descriptionPs: "په سکرو باندې پخه شوې مساله‌داره او تازه د چرګ تکه.",
    price: 450,
    category: "bbq",
    image: "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=700&q=80",
    available: true
  },
  {
    id: "bbq-2",
    nameEn: "Chicken Malai Boti",
    nameUr: "چکن ملائی بوٹی",
    namePs: "د چرګ ملایي بوټي",
    descriptionEn: "Melt-in-mouth boneless chicken cubes marinated in clotted cream, white pepper, and lemon.",
    descriptionUr: "بالائی اور سفید مرچ کے خاص مصالحہ میں گندھی ملائم ملائی بوٹی۔",
    descriptionPs: "په ملایي او لیمو کې نرمه او خوږه پخه شوې بې هډوکو بوټي.",
    price: 550,
    category: "bbq",
    image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=700&q=80",
    available: true
  },
  {
    id: "bbq-3",
    nameEn: "Beef Seekh Kebab (Plate)",
    nameUr: "بیف سیخ کباب",
    namePs: "د غوښې سیخ کباب",
    descriptionEn: "Finely minced prime beef blended with roasted cumin, onions, garlic, and fresh herbs.",
    descriptionUr: "تازہ گائے کے قیمے اور روایتی مصالحوں کے رسیلے کوئلہ کباب۔",
    descriptionPs: "د ښه او خوندور قیمې څخه جوړ شوي سیخ کباب.",
    price: 350,
    category: "bbq",
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=700&q=80",
    available: true
  },
  {
    id: "bbq-4",
    nameEn: "Chicken Reshmi Kebab",
    nameUr: "چکن ریشمی کباب",
    namePs: "د چرګ ریشمي کباب",
    descriptionEn: "Silken chicken mince mixed with butter and mild mountain herbs skewers.",
    descriptionUr: "مکھن اور ہلکے مصالحہ جات سے تیار انتہائی نرم ریشمی کباب۔",
    descriptionPs: "په کوچو او نرمو مصالحو کې جوړ شوی ریشمي کباب.",
    price: 500,
    category: "bbq",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=700&q=80",
    available: true
  },
  {
    id: "bbq-5",
    nameEn: "Special Beef Boti",
    nameUr: "بیف بوٹی کباب",
    namePs: "د غوښې تکه بوټي",
    descriptionEn: "Tenderized juicy beef cubes char-broiled to smoky perfection.",
    descriptionUr: "کوئلوں پر بھنی رسیلی اور خوشبو دار بیف بوٹی۔",
    descriptionPs: "په انګار پخه شوې تازه او خوندوره بیف بوټي.",
    price: 600,
    category: "bbq",
    image: "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?auto=format&fit=crop&w=700&q=80",
    available: true
  },

  // 3. KARAHI
  {
    id: "kar-1",
    nameEn: "Special Chicken Karahi (Full / 1kg)",
    nameUr: "شنواری چکن کڑاہی",
    namePs: "د چرګ ځانګړې کراهي",
    descriptionEn: "Prepared live with fresh tomatoes, ginger, green chilies, and black pepper in pure fat/ghee.",
    descriptionUr: "ٹماٹر، ادرک اور کالی مرچ سے تازہ بنی ہوئی مشہور روایتی چکن کڑاہی۔",
    descriptionPs: "په سرو رومي بانجانو، زنجبیل او تورو مرچکو کې تازه پخه شوې کراهي.",
    price: 1800,
    category: "karahi",
    image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=700&q=80",
    available: true
  },
  {
    id: "kar-2",
    nameEn: "Shinwari Mutton Karahi (Full / 1kg)",
    nameUr: "شنواری مٹن کڑاہی",
    namePs: "د پسه شنواري کراهي",
    descriptionEn: "Pishin valley mountain goat braised in its own natural tallow with coarse salt and green chillies.",
    descriptionUr: "پشین کی خاص پہاڑی بکری کا خالص چربی اور نمک میں تیار کردہ قدرتی مٹن کڑاہی۔",
    descriptionPs: "د پشین د تازه پسه غوښه په خپله غوړ او نمک کې پخه شوې کراهي.",
    price: 3000,
    category: "karahi",
    image: "https://images.unsplash.com/photo-1545247181-516773ca838b?auto=format&fit=crop&w=700&q=80",
    available: true
  },
  {
    id: "kar-3",
    nameEn: "White Chicken Karahi",
    nameUr: "چکن وائٹ کڑاہی",
    namePs: "سپینه د چرګ کراهي",
    descriptionEn: "Creamy white gravy simmered with yogurt, green cardamom, almond paste, and cracked white pepper.",
    descriptionUr: "دہی، بالائی اور بادام کے پیسٹ سے تیار کردہ سفید خوشبودار کڑاہی۔",
    descriptionPs: "په مستو، کریم او بادامو کې نرمه جوړه شوې سپینه کراهي.",
    price: 2000,
    category: "karahi",
    image: "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=700&q=80",
    available: true
  },
  {
    id: "kar-4",
    nameEn: "Claypot Chicken Handi",
    nameUr: "چکن ہانڈی مٹکا",
    namePs: "د خاورې خټکي چرګ هانډي",
    descriptionEn: "Boneless chicken slow-cooked in a terracotta pot with butter, fresh herbs, and tomato cream.",
    descriptionUr: "مٹی کے برتن میں دھیمی آنچ پر پکی ہوئی مکھنی بون لیس چکن ہانڈی۔",
    descriptionPs: "په خټین لوښي کې په آرامه پخه شوې کوچنۍ او خوندوره چکن هانډي.",
    price: 1700,
    category: "karahi",
    image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=700&q=80",
    available: true
  },
  {
    id: "kar-5",
    nameEn: "Desi Beef Karahi (Full / 1kg)",
    nameUr: "دیسی بیف کڑاہی",
    namePs: "د غوښې دیسی کراهي",
    descriptionEn: "Tender beef shank braised in iron wok with roasted garlic, tomatoes, and ground coriander.",
    descriptionUr: "لوہے کی کڑاہی میں بھنا ہوا ذائقہ دار دیسی بیف سالن۔",
    descriptionPs: "په وسپنیزه کراهي کې پخه شوې تازه د غوښې کراهي.",
    price: 2500,
    category: "karahi",
    image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=700&q=80",
    available: true
  },

  // 4. MAIN COURSE
  {
    id: "mc-1",
    nameEn: "Special Mutton Daal Gosht",
    nameUr: "دال گوشت مٹن",
    namePs: "دال او پسه غوښه",
    descriptionEn: "Gram lentils stewed alongside bone-in mutton with garlic tadka and green herbs.",
    descriptionUr: "چنے کی دال اور لذیذ مٹن کا لہسن تڑکا لگا شاہکار سالن۔",
    descriptionPs: "د نخودو دال او د پسه غوښه د اوږې په تودوخه کې.",
    price: 1200,
    category: "main-course",
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=700&q=80",
    available: true
  },
  {
    id: "mc-2",
    nameEn: "Chicken Qorma Royal",
    nameUr: "شاہی چکن قورمہ",
    namePs: "شاهي چرګ قورمه",
    descriptionEn: "Traditional Mughal-style chicken qorma prepared with caramelized onions, yogurt, and kewra.",
    descriptionUr: "تلی ہوئی پیاز، دہی اور کیوڑہ کی مہک سے سجا روایتی قورمہ۔",
    descriptionPs: "په سرو پیازو او مستو کې شاهي خوشبو داره قورمه.",
    price: 950,
    category: "main-course",
    image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=700&q=80",
    available: true
  },
  {
    id: "mc-3",
    nameEn: "Daal Mash Desi Ghee Fry",
    nameUr: "دال ماش فرائی دیسی گھی",
    namePs: "دال ماش په اصلي غوړو",
    descriptionEn: "White lentils pan-fried in pure desi ghee with julienned ginger, cumin, and dried red chilies.",
    descriptionUr: "دیسی گھی اور زیرے کے تڑکے والی سفید ماش کی خشک دال۔",
    descriptionPs: "په خالصو غوړو کې تالاو شوی ماش دال.",
    price: 450,
    category: "main-course",
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=700&q=80",
    available: true
  },
  {
    id: "mc-4",
    nameEn: "Chicken Haleem Special",
    nameUr: "خاص چکن حلیم",
    namePs: "ځانګړی حلیم",
    descriptionEn: "Slow-simmered blend of wheat, barley, lentils, and shredded chicken with crispy onions.",
    descriptionUr: "گندم، دالوں اور ریشہ دار چکن سے گھنٹوں پکائی گئی لاجواب حلیم۔",
    descriptionPs: "د غنمو، دالونو او چرګ له غوښې جوړ شوی دودیز حلیم.",
    price: 500,
    category: "main-course",
    image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=700&q=80",
    available: true
  },
  {
    id: "mc-5",
    nameEn: "Mix Vegetable Handi",
    nameUr: "مکس سبزی ہانڈی",
    namePs: "ګډ سبزي هانډي",
    descriptionEn: "Fresh seasonal vegetables sauteed with cumin, turmeric, and garden tomatoes.",
    descriptionUr: "موسمی تازہ سبزیاں زیرہ اور ٹماٹر کی ہلکی گریوی میں۔",
    descriptionPs: "تازه موسمي سبزیانې په خوندورو مصالحو کې.",
    price: 400,
    category: "main-course",
    image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=700&q=80",
    available: true
  },

  // 5. RICE & BIRYANI
  {
    id: "rb-1",
    nameEn: "Special Chicken Dum Biryani",
    nameUr: "خاص چکن دم بریانی",
    namePs: "ځانګړې چرګ دم بریاني",
    descriptionEn: "Aromatic long-grain basmati rice layered with spiced marinated chicken and saffron steam.",
    descriptionUr: "زعفرانی خوشبو اور چکن کے ساتھ دم پر تیار لذیذ بریانی۔",
    descriptionPs: "د زعفرانو او مساله‌دار چرګ سره پخه شوې دم بریاني.",
    price: 650,
    category: "rice-biryani",
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=700&q=80",
    available: true
  },
  {
    id: "rb-2",
    nameEn: "Kabuli Pulao Mutton Special",
    nameUr: "کابلی مٹن پلاؤ",
    namePs: "کابلي د پسه پلاو",
    descriptionEn: "Balochistan favourite sweet-savoury rice topped with caramelized carrots, raisins, and tender mutton shank.",
    descriptionUr: "بلوچستان کا پسندیدہ کابلی پلاؤ کشمش، گاجر اور مٹن کے ساتھ۔",
    descriptionPs: "د پشین او کوټې مشهور کابلي پلاو له ممیزو، ګازرو او غوښې سره.",
    price: 1100,
    category: "rice-biryani",
    image: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=700&q=80",
    available: true
  },
  {
    id: "rb-3",
    nameEn: "Beef Yakhni Pulao",
    nameUr: "بیف یخنی پلاؤ",
    namePs: "د غوښې یخني پلاو",
    descriptionEn: "Aged basmati rice cooked deeply in rich beef bone broth, whole spices, and fried shallots.",
    descriptionUr: "خالص بیف کی یخنی اور ثابت گرم مصالحوں میں رچا پلاؤ۔",
    descriptionPs: "د بیف په یخني او خوشبو دار مصالحو کې جوړ شوی پلاو.",
    price: 800,
    category: "rice-biryani",
    image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=700&q=80",
    available: true
  },
  {
    id: "rb-4",
    nameEn: "Sada Basmati Rice Plate",
    nameUr: "سادہ چاول زیرہ تڑکا",
    namePs: "ساده وریجې د زیرې سره",
    descriptionEn: "Steamed fluffy basmati rice with cumin infusion to pair with karahi and daal.",
    descriptionUr: "کڑاہی اور دال کے ساتھ کھانے کے لیے سفید زیرہ چاول۔",
    descriptionPs: "د کراهي او دال سره د خوړلو لپاره سپینې وریجې.",
    price: 250,
    category: "rice-biryani",
    image: "https://images.unsplash.com/photo-1516714435131-44d6b64dc6a2?auto=format&fit=crop&w=700&q=80",
    available: true
  },
  {
    id: "rb-5",
    nameEn: "Chicken Fried Rice",
    nameUr: "چکن فرائیڈ رائس",
    namePs: "د چرګ تالاو شوې وریجې",
    descriptionEn: "Wok-tossed rice with shredded chicken breast, scrambled egg, scallions, and soy.",
    descriptionUr: "چکن، انڈے اور تازہ سبزیوں کے ساتھ واک فرائیڈ چاول۔",
    descriptionPs: "د چرګ ټوټو، هګۍ او سبزیو سره په توده لوښي کې تالاو شوې وریجې.",
    price: 550,
    category: "rice-biryani",
    image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=700&q=80",
    available: true
  },

  // 6. CHINESE
  {
    id: "ch-1",
    nameEn: "Chicken Manchurian with Rice",
    nameUr: "چکن منچورین و چاول",
    namePs: "چرګ منچورین له وریجو سره",
    descriptionEn: "Crisp chicken pieces tossed in tangy garlic-tomato glaze served with egg fried rice.",
    descriptionUr: "کھٹی میٹھی لہسن گریوی میں چکن منچورین ساتھ انڈے والے چاول۔",
    descriptionPs: "په ځانګړي ساس کې د چرګ منچورین د وریجو سره.",
    price: 850,
    category: "chinese",
    image: "https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=700&q=80",
    available: true
  },
  {
    id: "ch-2",
    nameEn: "Chicken Shashlik with Rice",
    nameUr: "چکن شاشلک",
    namePs: "چرګ شاشلیک",
    descriptionEn: "Skewered chicken, bell peppers, and onions in sweet-spicy Chinese gravy.",
    descriptionUr: "شملہ مرچ، پیاز اور چکن کا ساس والا مزیدار شاشلک۔",
    descriptionPs: "د شنه مرچ او پیازو سره چکن شاشلیک.",
    price: 800,
    category: "chinese",
    image: "https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=700&q=80",
    available: true
  },
  {
    id: "ch-3",
    nameEn: "Chicken Chow Mein",
    nameUr: "چکن چاؤمین",
    namePs: "چرګ چاو مین",
    descriptionEn: "Stir-fried noodles loaded with julienned cabbage, carrots, capsicum, and chicken slices.",
    descriptionUr: "تازہ نوڈلز، چکن اور کرنچی سبزیوں سے بھرا روایتی چاؤمین۔",
    descriptionPs: "نوډلز له تازه چرګ او سبزیو سره.",
    price: 650,
    category: "chinese",
    image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=700&q=80",
    available: true
  },
  {
    id: "ch-4",
    nameEn: "Hot & Sour Soup (Bowl)",
    nameUr: "ہاٹ اینڈ سار سوپ",
    namePs: "ترو او تود سوپ",
    descriptionEn: "Piping soup loaded with shredded chicken, black mushrooms, egg ribbons, and chili vinegar.",
    descriptionUr: "سردیوں کا بہترین چکن اور انڈے کا کٹھا میٹھا ہاٹ سوپ۔",
    descriptionPs: "د چرګ او هګۍ ګرم او خوندور سوپ.",
    price: 350,
    category: "chinese",
    image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=700&q=80",
    available: true
  },
  {
    id: "ch-5",
    nameEn: "Crisp Chicken Spring Rolls (4 pcs)",
    nameUr: "چکن اسپرنگ رولز",
    namePs: "چرګ سپرنګ رول",
    descriptionEn: "Golden pastry crust filled with savory chicken and vegetable slaw with sweet chili dip.",
    descriptionUr: "کرسپی چکن اور سبزی سے بھرے رولز چٹنی کے ساتھ۔",
    descriptionPs: "کرکره سپرنګ رولونه له چټني سره.",
    price: 350,
    category: "chinese",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=700&q=80",
    available: true
  },

  // 7. FAST FOOD
  {
    id: "ff-1",
    nameEn: "Crispy Zinger Burger & Fries",
    nameUr: "کرسپی زنگر برگر اور فرائز",
    namePs: "زنګر برګر او چپس",
    descriptionEn: "Golden crunchy battered chicken breast fillet with iceberg lettuce and secret garlic mayo.",
    descriptionUr: "کرچی چکن فلے، تازہ سلاد اور لذیذ مایو ساس کے ساتھ زنگر برگر۔",
    descriptionPs: "کرکره د چرګ زنګر برګر له چپسو سره.",
    price: 450,
    category: "fast-food",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=700&q=80",
    available: true
  },
  {
    id: "ff-2",
    nameEn: "Double Beef Patty Cheese Burger",
    nameUr: "ڈبل بیف چیز برگر",
    namePs: "دوه ګونی بیف چیز برګر",
    descriptionEn: "Two grilled 100% beef patties layered with melted cheddar cheese and caramelized onions.",
    descriptionUr: "دو گائے کے کباب اور پگھلے ہوئے پنیر کا شاہی برگر۔",
    descriptionPs: "دوه د غوښې کبابونه له پنیر سره په برګر کې.",
    price: 600,
    category: "fast-food",
    image: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=700&q=80",
    available: true
  },
  {
    id: "ff-3",
    nameEn: "Crispy Broast Chicken (Quarter)",
    nameUr: "کرسپی چکن بروسٹ",
    namePs: "کرکره بروسټ چرګ",
    descriptionEn: "Deep pressure fried spiced chicken quarter served with fries, garlic sauce, and dinner bun.",
    descriptionUr: "گولڈن کرسپی بروسٹ فرائز اور گارلک ساس کے ساتھ۔",
    descriptionPs: "کرکره بروسټ چرګ د اوږې ساس سره.",
    price: 550,
    category: "fast-food",
    image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=700&q=80",
    available: true
  },
  {
    id: "ff-4",
    nameEn: "Chicken Tikka Club Sandwich",
    nameUr: "کلب سینڈوچ",
    namePs: "کلب سینډویچ",
    descriptionEn: "Triple-decker toasted bread filled with tikka strips, fried egg, cheese, and lettuce.",
    descriptionUr: "تین پرتوں والا سینڈوچ، چکن تکہ، انڈا اور چیز۔",
    descriptionPs: "د چرګ تکه، هګۍ او پنیر درې طبقې سینډویچ.",
    price: 450,
    category: "fast-food",
    image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=700&q=80",
    available: true
  },
  {
    id: "ff-5",
    nameEn: "Masala French Fries Basket",
    nameUr: "مصالحہ فرنچ فرائز",
    namePs: "مساله‌دار چپس",
    descriptionEn: "Crisp potato fries dusted with zesty chaat masala and chili sprinkle.",
    descriptionUr: "گرم اور خستہ آلو کی چپس چٹپٹے مصالحے کے ساتھ۔",
    descriptionPs: "کرکره کچالو چپس له چټپټې مسالې سره.",
    price: 250,
    category: "fast-food",
    image: "https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=700&q=80",
    available: true
  },

  // 8. NAAN & ROTI
  {
    id: "nr-1",
    nameEn: "Special Roghni Naan",
    nameUr: "روغنی نان",
    namePs: "روغني نان",
    descriptionEn: "Fluffy tandoori flatbread brushed with butter and sprinkled with white sesame seeds.",
    descriptionUr: "تندور کا نرم و ملائم نان، مکھن اور سفید تلوں کے ساتھ۔",
    descriptionPs: "په تندور کې پخه شوې روغني ډوډۍ له تلو سره.",
    price: 80,
    category: "naan-roti",
    image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=700&q=80",
    available: true
  },
  {
    id: "nr-2",
    nameEn: "Tandoori Sada Roti",
    nameUr: "تندوری سادہ روٹی",
    namePs: "تندوري ساده ډوډۍ",
    descriptionEn: "Whole wheat traditional clay-oven baked bread.",
    descriptionUr: "تندور کی تازہ اور نرم گندم کی روٹی۔",
    descriptionPs: "د تندور تازه او ګرمه ساده ډوډۍ.",
    price: 30,
    category: "naan-roti",
    image: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=700&q=80",
    available: true
  },
  {
    id: "nr-3",
    nameEn: "Garlic Butter Naan",
    nameUr: "گارلک مکھن نان",
    namePs: "د اوږې کوچنی نان",
    descriptionEn: "Tandoor naan infused with chopped roasted garlic, fresh coriander, and melted butter.",
    descriptionUr: "لہسن اور دیسی مکھن سے مہکتا ہوا گرما گرم نان۔",
    descriptionPs: "د اوږې او کوچو خوندور نان.",
    price: 100,
    category: "naan-roti",
    image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=700&q=80",
    available: true
  },
  {
    id: "nr-4",
    nameEn: "Keema Wala Naan (Beef Mince)",
    nameUr: "قیمہ والا نان",
    namePs: "د قیمې نان",
    descriptionEn: "Stuffed tandoori bread filled with seasoned beef mince and mild spices.",
    descriptionUr: "بیف قیمے سے بھرا ہوا تندور کا لذیذ نان۔",
    descriptionPs: "د ښه غوښې قیمې ډک شوی تندوري نان.",
    price: 280,
    category: "naan-roti",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=700&q=80",
    available: true
  },
  {
    id: "nr-5",
    nameEn: "Kalwanji Naan",
    nameUr: "کلونجی نان",
    namePs: "د تورې دانې نان",
    descriptionEn: "Fragrant naan topped with nigella seeds (kalonji) baked in roaring tandoor.",
    descriptionUr: "کلونجی کے دانوں سے مزین روایتی نان۔",
    descriptionPs: "د کلونجي تورې دانې سره پخ شوی نان.",
    price: 70,
    category: "naan-roti",
    image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=700&q=80",
    available: true
  },

  // 9. DRINKS
  {
    id: "dr-1",
    nameEn: "Sweet Lassi Pitcher",
    nameUr: "میٹھی دیسی لسی",
    namePs: "خواږه مسته شوملې",
    descriptionEn: "Traditional chilled yogurt churned with creamy malai top and sugar.",
    descriptionUr: "خالص دہی اور بالائی کی ٹھنڈی روایتی میٹھی لسی۔",
    descriptionPs: "د تازه مستو یخه او خوندوره شوملې.",
    price: 180,
    category: "drinks",
    image: "https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=700&q=80",
    available: true
  },
  {
    id: "dr-2",
    nameEn: "Salted Namkeen Lassi",
    nameUr: "نمکین لسی",
    namePs: "مالګینې شوملې",
    descriptionEn: "Savory churned yogurt with roasted cumin powder and rock salt.",
    descriptionUr: "بھنے زیرے اور نمک کے ساتھ فرحت بخش نمکین لسی۔",
    descriptionPs: "د زیرې او مالګې سره جوړه شوې مالګینه شوملې.",
    price: 150,
    category: "drinks",
    image: "https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=700&q=80",
    available: true
  },
  {
    id: "dr-3",
    nameEn: "Fresh Mint Lemonade",
    nameUr: "منٹ لیمونیڈ مارگریٹا",
    namePs: "د نعناع او لیمو څښاک",
    descriptionEn: "Crushed mountain mint, freshly squeezed lemons, and black salt over cracked ice.",
    descriptionUr: "پودینہ، لیموں اور کالا نمک کی ٹھنڈی تازہ پیاس بجھاتی ڈرنک۔",
    descriptionPs: "د پودینې او تازه لیمو یخ څښاک.",
    price: 220,
    category: "drinks",
    image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=700&q=80",
    available: true
  },
  {
    id: "dr-4",
    nameEn: "Cold Soft Drinks (500ml / Can)",
    nameUr: "کولڈ ڈرنکس (بوتل)",
    namePs: "ګاز لرونکي سړه مشروبات",
    descriptionEn: "Chilled Pepsi, 7Up, Mirinda, or Mountain Dew.",
    descriptionUr: "پیپسی، سیون اپ، مرنڈا، یا ماؤنٹین ڈیو۔",
    descriptionPs: "پیپسي، سیون اپ، مرینډا یا ماونټین ډیو.",
    price: 120,
    category: "drinks",
    image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=700&q=80",
    available: true
  },
  {
    id: "dr-5",
    nameEn: "Green Tea / Peshawari Kehwa",
    nameUr: "پیشاوری قہوہ سبز الائچی",
    namePs: "شین چای له لاچي سره",
    descriptionEn: "Digestive green tea brewed with whole green cardamom and sweetened lightly.",
    descriptionUr: "کھانے کے بعد ہاضمے کے لیے الائچی والا گرما گرم قہوہ۔",
    descriptionPs: "له خوراک وروسته د هاضمې شین چای له شنه لاچي سره.",
    price: 80,
    category: "drinks",
    image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=700&q=80",
    available: true
  },

  // 10. DESSERTS
  {
    id: "ds-1",
    nameEn: "Hot Gulab Jamun (2 pcs)",
    nameUr: "گرم گلاب جامن",
    namePs: "ګرم ګلاب جامن",
    descriptionEn: "Soft milk-solid dumplings soaked in rose and saffron scented sugar syrup.",
    descriptionUr: "شیرینی میں ڈوبے ہوئے روایتی گرم نرم گلاب جامن۔",
    descriptionPs: "په خوږه شربت کې ډوب شوي نرم ګلاب جامن.",
    price: 180,
    category: "desserts",
    image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=700&q=80",
    available: true
  },
  {
    id: "ds-2",
    nameEn: "Special Matka Kheer",
    nameUr: "مٹکا کھیر بادام پستہ",
    namePs: "د خټکي مټکا کټی",
    descriptionEn: "Creamy slow-reduced rice pudding served chilled in clay bowl with crushed pistachios.",
    descriptionUr: "مٹی کے برتن میں ٹھنڈی کھیر، کٹے ہوئے بادام اور پستے کے ساتھ۔",
    descriptionPs: "په خټین لوښي کې سړه جوړه شوې خوږه کټي له پستې سره.",
    price: 250,
    category: "desserts",
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=700&q=80",
    available: true
  },
  {
    id: "ds-3",
    nameEn: "Desi Ghee Suji Halwa",
    nameUr: "دیسی گھی سوجی حلوہ",
    namePs: "د اصلي غوړو سوجي حلوه",
    descriptionEn: "Golden roasted semolina simmered with pure desi butter and raisins.",
    descriptionUr: "دیسی گھی میں بھنا ہوا سوجی کا گرما گرم حلوہ۔",
    descriptionPs: "په خالصو غوړو کې جوړه شوې سوجي حلوه.",
    price: 220,
    category: "desserts",
    image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=700&q=80",
    available: true
  },
  {
    id: "ds-4",
    nameEn: "Kulfi Falooda Royal",
    nameUr: "شاہی کلفی فالودہ",
    namePs: "شاهي قلفي فالوده",
    descriptionEn: "Frozen traditional khoya kulfi over vermicelli ribbons, basil seeds, and Rooh Afza.",
    descriptionUr: "کھویا قلفی، تخم بالنگا اور روح افزا سے تیار شاہی فالودہ۔",
    descriptionPs: "دودیزه قلفي د فالوده او شربت سره.",
    price: 350,
    category: "desserts",
    image: "https://images.unsplash.com/photo-1501443762994-82bd5dace89a?auto=format&fit=crop&w=700&q=80",
    available: true
  },
  {
    id: "ds-5",
    nameEn: "Ras Malai (2 pcs)",
    nameUr: "رس ملائی",
    namePs: "رس ملایي",
    descriptionEn: "Delicate cottage cheese cakes floating in sweet cardamom-scented saffron cream milk.",
    descriptionUr: "زعفران اور الائچی کے دودھ میں ڈوبی ہوئی ملائم رس ملائی۔",
    descriptionPs: "په زعفراني شیدو کې نرمه رس ملایي.",
    price: 260,
    category: "desserts",
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=700&q=80",
    available: true
  }
];

export const INITIAL_SETTINGS = {
  hotelName: "Sharjah Hotel Yaru",
  phone: "0301 6372561",
  location: "Yaru, Pishin, Balochistan, Pakistan",
  openingHours: "Open",
  closingHours: "Closes at 2:00 AM",
  priceRange: "Rs. 2,000–3,000 per person",
  services: [
    "Cash Only",
    "All You Can Eat",
    "Outdoor Seating"
  ],
  googleReviewsCount: 423,
  currency: "Rs.",
  updatedAt: new Date().toISOString()
};

/**
 * Seed initial dishes into Firestore if the collection is empty.
 * Ensures idempotent execution to prevent duplicate items.
 */
export async function seedDatabaseIfEmpty() {
  try {
    const colRef = collection(db, "menuItems");
    const snapshot = await getDocs(colRef);
    
    if (snapshot.size > 0) {
      console.log(`Database already contains ${snapshot.size} menu items. Skipping duplicate seed.`);
      return { seeded: false, count: snapshot.size };
    }

    console.log("Seeding initial menu items to Firestore...");
    const batch = writeBatch(db);

    INITIAL_MENU_ITEMS.forEach((item) => {
      const docRef = doc(db, "menuItems", item.id);
      batch.set(docRef, {
        nameEn: item.nameEn,
        nameUr: item.nameUr,
        namePs: item.namePs,
        descriptionEn: item.descriptionEn,
        descriptionUr: item.descriptionUr,
        descriptionPs: item.descriptionPs,
        price: Number(item.price),
        category: item.category,
        image: item.image,
        available: Boolean(item.available),
        createdAt: new Date().toISOString()
      });
    });

    // Also seed default settings
    const settingsDoc = doc(db, "settings", "general");
    batch.set(settingsDoc, INITIAL_SETTINGS);

    await batch.commit();
    console.log(`Successfully seeded ${INITIAL_MENU_ITEMS.length} dishes to Firestore!`);
    return { seeded: true, count: INITIAL_MENU_ITEMS.length };
  } catch (error) {
    console.error("Error seeding Firestore database:", error);
    // Don't crash if offline - app falls back gracefully to INITIAL_MENU_ITEMS
    return { seeded: false, error };
  }
}
