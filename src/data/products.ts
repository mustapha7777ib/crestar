import type { Product, Variant } from "@/lib/catalog-types";

// The starting catalogue. prisma/seed.ts loads it into the database once; after
// that the database is the source of truth and products are edited in /admin.
// Prices are integer dirhams (QAR 24 = 2400), weights grams.

type SeedVariant = Omit<Variant, "stock" | "weight">;
type SeedProduct = Omit<Product, "variants"> & { variants: SeedVariant[] };

const label = {
  weight: { en: "Net weight", ar: "الوزن الصافي" },
  ingredients: { en: "Ingredients", ar: "المكوّنات" },
  storage: { en: "Storage", ar: "التخزين" },
  use: { en: "How to use", ar: "طريقة الاستخدام" },
  material: { en: "Material", ar: "الخامة" },
  dimensions: { en: "Dimensions", ar: "الأبعاد" },
  care: { en: "Care", ar: "العناية" },
  technique: { en: "Technique", ar: "التقنية" },
  burn: { en: "Burn time", ar: "مدة الاشتعال" },
};

const coolDry = { en: "Airtight, cool and dry, away from sunlight.", ar: "في عبوة محكمة الإغلاق، في مكان بارد وجاف بعيدًا عن الشمس." };
const badges = {
  bestseller: { en: "Bestseller", ar: "الأكثر مبيعًا" },
  new: { en: "New", ar: "جديد" },
  limited: { en: "Limited", ar: "كمية محدودة" },
  chef: { en: "Chef's choice", ar: "اختيار الطهاة" },
};

const base: SeedProduct[] = [
  // ——— The Pantry ———
  {
    slug: "zobo-dried-hibiscus",
    category: "pantry",
    name: { en: "Zobo Dried Hibiscus", ar: "كركديه زوبو المجفف" },
    tagline: { en: "Whole sun-dried calyces", ar: "كؤوس كاملة مجففة تحت الشمس" },
    story: {
      en: "Deep-red roselle calyces, hand-picked after the rains in Kano and dried slowly on raised mats. The same flower the Gulf knows as karkadeh: tart, fruity and the colour of garnet once steeped. Brew it hot with ginger and cloves, or cold overnight for a clean, bright zobo.",
      ar: "كؤوس الكركديه الحمراء الداكنة، تُقطف يدويًا بعد موسم الأمطار في كانو وتُجفف ببطء على حُصر مرفوعة. إنها الزهرة نفسها التي يعرفها الخليج باسم الكركديه: حامضة وفاكهية ولونها كالعقيق بعد النقع. حضّرها ساخنة مع الزنجبيل والقرنفل، أو باردة طوال الليل لزوبو صافٍ ومنعش.",
    },
    town: "kano",
    details: [
      { label: label.ingredients, value: { en: "100% whole dried Hibiscus sabdariffa calyces", ar: "100٪ كؤوس كركديه مجففة كاملة" } },
      { label: label.use, value: { en: "40g to 1.5L water. Simmer 15 minutes, strain and chill.", ar: "40 غرامًا لكل 1.5 لتر ماء. يُغلى على نار هادئة 15 دقيقة ثم يُصفّى ويُبرَّد." } },
      { label: label.storage, value: coolDry },
    ],
    images: ["/images/products/hibiscus-1.jpg", "/images/products/hibiscus-2.jpg", "/images/products/hibiscus-3.jpg"],
    variants: [
      { id: "250g", label: { en: "250g", ar: "250 غ" }, price: 29_00 },
      { id: "500g", label: { en: "500g", ar: "500 غ" }, price: 52_00 },
      { id: "1kg", label: { en: "1kg", ar: "1 كغ" }, price: 95_00 },
    ],
    badge: badges.bestseller,
    featured: 1,
  },
  {
    slug: "benniseed-white-sesame",
    category: "pantry",
    name: { en: "Benniseed White Sesame", ar: "سمسم بِنّيسيد الأبيض" },
    tagline: { en: "Hulled, sun-dried, nutty", ar: "مقشور، مجفف بالشمس، بنكهة الجوز" },
    story: {
      en: "Nigeria is one of the world's great sesame growers, and the Benue valley grows some of its best. Our benniseed is hulled and sun-dried, small, pale and rich with oil. Toast it for tahini and halwa, scatter it over bread, or grind it into West African soups and stews.",
      ar: "نيجيريا من أكبر منتجي السمسم في العالم، ووادي بينوي يزرع بعضًا من أجوده. سمسم بِنّيسيد لدينا مقشور ومجفف بالشمس، صغير الحبة فاتح اللون وغني بالزيت. حمّصه للطحينة والحلاوة، أو انثره على الخبز، أو اطحنه في حساء غرب أفريقيا ويخناته.",
    },
    town: "nasarawa",
    details: [
      { label: label.ingredients, value: { en: "Hulled white sesame seeds (Sesamum indicum)", ar: "بذور سمسم أبيض مقشورة" } },
      { label: label.use, value: { en: "Toast in a dry pan for 3–4 minutes to bring out the oil.", ar: "حمّصه في مقلاة جافة 3–4 دقائق لتظهر زيوته." } },
      { label: label.storage, value: coolDry },
    ],
    images: ["/images/products/sesame-1.jpg", "/images/products/sesame-2.jpg"],
    variants: [
      { id: "500g", label: { en: "500g", ar: "500 غ" }, price: 24_00 },
      { id: "1kg", label: { en: "1kg", ar: "1 كغ" }, price: 42_00 },
    ],
    featured: 3,
  },
  {
    slug: "egusi-melon-seeds",
    category: "pantry",
    name: { en: "Egusi Melon Seeds", ar: "بذور الإيغوسي" },
    tagline: { en: "Shelled, for soups and stews", ar: "مقشورة، للحساء واليخنات" },
    story: {
      en: "The heart of egusi soup, one of Nigeria's best-loved dishes. These shelled seeds of the West African melon are ground and simmered with palm oil, leafy greens and stock until they set into rich, savoury curds. Hand-shelled in Benue and cleaned twice.",
      ar: "أساس حساء الإيغوسي، أحد أحبّ الأطباق النيجيرية. بذور البطيخ الغرب أفريقي المقشورة، تُطحن وتُطهى مع زيت النخيل والخضار الورقية والمرق حتى تتماسك في قطع غنية بالنكهة. قُشّرت يدويًا في بينوي ونُظّفت مرتين.",
    },
    town: "benue",
    details: [
      { label: label.ingredients, value: { en: "Shelled egusi seeds (Citrullus lanatus)", ar: "بذور إيغوسي مقشورة" } },
      { label: label.use, value: { en: "Grind just before cooking for the fullest flavour.", ar: "اطحنها قبل الطهي مباشرة للحصول على أغنى نكهة." } },
      { label: label.storage, value: coolDry },
    ],
    images: ["/images/products/egusi-1.jpg", "/images/products/egusi-2.jpg"],
    variants: [
      { id: "500g", label: { en: "500g", ar: "500 غ" }, price: 34_00 },
      { id: "1kg", label: { en: "1kg", ar: "1 كغ" }, price: 62_00 },
    ],
  },
  {
    slug: "yaji-suya-spice",
    category: "pantry",
    name: { en: "Yaji Suya Spice", ar: "بهارات السويا (ياجي)" },
    tagline: { en: "Kano's legendary grill rub", ar: "خلطة الشواء الشهيرة من كانو" },
    story: {
      en: "The smoky, peppery rub behind suya, the grilled skewers sold by the light of charcoal fires across northern Nigeria. Roasted groundnut, dried chilli, ginger and a little calabash nutmeg, blended to a family recipe in Kano. Superb on lamb, chicken and halloumi.",
      ar: "الخلطة المدخّنة الحارة وراء السويا، أسياخ اللحم المشوية التي تُباع على ضوء جمر الفحم في شمال نيجيريا. فول سوداني محمّص وفلفل حار مجفف وزنجبيل وقليل من جوزة القرع، ممزوجة وفق وصفة عائلية في كانو. رائعة مع لحم الضأن والدجاج والحلوم.",
    },
    town: "kano",
    details: [
      { label: label.ingredients, value: { en: "Roasted groundnut, chilli, ginger, calabash nutmeg, salt. Contains peanuts.", ar: "فول سوداني محمّص، فلفل حار، زنجبيل، جوزة القرع، ملح. يحتوي على الفول السوداني." } },
      { label: label.use, value: { en: "Rub generously on thin-sliced meat with a little oil; grill over high heat.", ar: "افركها بسخاء على شرائح لحم رقيقة مع قليل من الزيت، واشوِها على نار عالية." } },
      { label: label.storage, value: coolDry },
    ],
    images: ["/images/products/yaji-1.jpg"],
    variants: [
      { id: "150g", label: { en: "150g", ar: "150 غ" }, price: 26_00 },
      { id: "300g", label: { en: "300g", ar: "300 غ" }, price: 46_00 },
    ],
    badge: badges.new,
    featured: 5,
  },
  {
    slug: "moringa-leaf-powder",
    category: "pantry",
    name: { en: "Moringa Leaf Powder", ar: "مسحوق أوراق المورينغا" },
    tagline: { en: "Shade-dried, stone-milled", ar: "مجفف في الظل، مطحون بالحجر" },
    story: {
      en: "Young moringa leaves from smallholder farms around Kaduna, dried in the shade to keep their colour and milled fine. Earthy and grassy, a teaspoon brightens a smoothie, a bowl of yoghurt or a pot of soup.",
      ar: "أوراق مورينغا فتية من مزارع صغيرة حول كادونا، تُجفف في الظل لتحتفظ بلونها وتُطحن ناعمًا. نكهتها ترابية عشبية؛ ملعقة صغيرة تنعش العصير أو الزبادي أو قدر الحساء.",
    },
    town: "kaduna",
    details: [
      { label: label.ingredients, value: { en: "100% Moringa oleifera leaf", ar: "100٪ أوراق المورينغا" } },
      { label: label.use, value: { en: "1 teaspoon a day in drinks or food.", ar: "ملعقة صغيرة يوميًا في المشروبات أو الطعام." } },
      { label: label.storage, value: coolDry },
    ],
    images: ["/images/products/moringa-1.jpg", "/images/products/moringa-2.jpg"],
    variants: [
      { id: "200g", label: { en: "200g", ar: "200 غ" }, price: 35_00 },
      { id: "500g", label: { en: "500g", ar: "500 غ" }, price: 79_00 },
    ],
  },
  {
    slug: "zanzibar-whole-cloves",
    category: "pantry",
    name: { en: "Zanzibar Whole Cloves", ar: "قرنفل زنجبار الكامل" },
    tagline: { en: "Hand-sorted, intensely aromatic", ar: "مفروز يدويًا، عطري للغاية" },
    story: {
      en: "From the clove gardens of Pemba, the island that has perfumed Indian Ocean trade for two centuries. Fat, oil-rich buds, hand-sorted for size. Essential in zobo, in spiced rice and in the coffee of the Gulf.",
      ar: "من بساتين القرنفل في جزيرة بيمبا، التي عطّرت تجارة المحيط الهندي طوال قرنين. براعم ممتلئة غنية بالزيت، مفروزة يدويًا حسب الحجم. لا غنى عنها في الزوبو والأرز المتبّل والقهوة الخليجية.",
    },
    town: "pemba",
    details: [
      { label: label.ingredients, value: { en: "Whole cloves (Syzygium aromaticum)", ar: "قرنفل كامل" } },
      { label: label.storage, value: coolDry },
    ],
    images: ["/images/products/cloves-1.jpg"],
    variants: [
      { id: "100g", label: { en: "100g", ar: "100 غ" }, price: 22_00 },
      { id: "250g", label: { en: "250g", ar: "250 غ" }, price: 48_00 },
    ],
  },

  // ——— Body & Wellness ———
  {
    slug: "raw-shea-butter",
    category: "body",
    name: { en: "Raw Unrefined Shea Butter", ar: "زبدة الشيا الخام غير المكررة" },
    tagline: { en: "Hand-churned by women's co-operatives", ar: "تُخفق يدويًا في تعاونيات نسائية" },
    story: {
      en: "Grade-A shea butter, hand-churned by a women's co-operative in Niger State from nuts gathered in the savannah. Never bleached or deodorised, so it keeps its ivory colour, nutty scent and all its vitamins. Melts on contact with skin; wonderful on hair, hands and heels in the dry Gulf winter.",
      ar: "زبدة شيا من الدرجة الأولى، تخفقها يدويًا تعاونية نسائية في ولاية النيجر من ثمار تُجمع في السافانا. لا تُبيَّض ولا تُزال رائحتها، فتحتفظ بلونها العاجي ورائحتها الجوزية وكل فيتاميناتها. تذوب بمجرد ملامسة البشرة، ورائعة للشعر واليدين والكعبين في شتاء الخليج الجاف.",
    },
    town: "niger",
    details: [
      { label: label.ingredients, value: { en: "100% unrefined Vitellaria paradoxa butter", ar: "100٪ زبدة شيا غير مكررة" } },
      { label: label.use, value: { en: "Warm a little between your palms and press into skin or hair.", ar: "دفّئ كمية صغيرة بين راحتيك ثم اضغطها على البشرة أو الشعر." } },
      { label: label.storage, value: { en: "Below 25°C. Softens in heat; this is natural.", ar: "تحت 25 درجة مئوية. تلين مع الحرارة وهذا طبيعي." } },
    ],
    images: ["/images/products/shea-1.jpg", "/images/products/shea-2.jpg"],
    variants: [
      { id: "250g", label: { en: "250g", ar: "250 غ" }, price: 38_00 },
      { id: "500g", label: { en: "500g", ar: "500 غ" }, price: 68_00 },
    ],
    featured: 2,
  },
  {
    slug: "ose-dudu-black-soap",
    category: "body",
    name: { en: "Ose Dudu Black Soap", ar: "صابون أوسي دودو الأسود" },
    tagline: { en: "Plantain ash, palm kernel & shea", ar: "رماد الموز وزيت النخيل والشيا" },
    story: {
      en: "Yoruba black soap, made in Abeokuta from the ash of sun-dried plantain skins and cocoa pods, cooked slowly with palm kernel oil and shea. Soft, crumbly and deeply cleansing, with a gentle earthy scent. Use for face, body and hair.",
      ar: "صابون اليوروبا الأسود، يُصنع في أبيوكوتا من رماد قشور الموز المجففة وقرون الكاكاو، ويُطهى ببطء مع زيت نواة النخيل والشيا. ناعم وقابل للتفتت ومنظّف بعمق، برائحة ترابية لطيفة. للوجه والجسم والشعر.",
    },
    town: "abeokuta",
    details: [
      { label: label.ingredients, value: { en: "Plantain skin ash, cocoa pod ash, palm kernel oil, shea butter, water", ar: "رماد قشر الموز، رماد قرون الكاكاو، زيت نواة النخيل، زبدة الشيا، ماء" } },
      { label: label.use, value: { en: "Pinch off a piece, lather in wet hands. Keep the bar dry between uses.", ar: "اقتطع قطعة صغيرة واصنع رغوة بين يدين مبللتين. أبقِ الصابونة جافة بين الاستخدامات." } },
    ],
    images: ["/images/products/soap-1.jpg"],
    variants: [
      { id: "200g", label: { en: "200g bar", ar: "قطعة 200 غ" }, price: 32_00 },
      { id: "3x200g", label: { en: "Set of 3", ar: "مجموعة من 3" }, price: 85_00 },
    ],
  },

  // ——— Hearth & Charcoal ———
  {
    slug: "hardwood-lump-charcoal",
    category: "hearth",
    name: { en: "Hardwood Lump Charcoal", ar: "فحم الخشب الصلب" },
    tagline: { en: "Long, clean, almost smokeless burn", ar: "اشتعال طويل ونظيف وشبه خالٍ من الدخان" },
    story: {
      en: "Kiln-carbonised from dense Nigerian savannah hardwoods, then screened so only large, even lumps make the bag. It lights quickly, holds a steady high heat for hours and leaves very little ash. Made for the weekend grill, the desert camp and the majlis brazier.",
      ar: "يُكربن في أفران من أخشاب السافانا النيجيرية الصلبة الكثيفة، ثم يُغربل بحيث لا يدخل الكيس إلا القطع الكبيرة المتساوية. يشتعل بسرعة ويحافظ على حرارة عالية ثابتة لساعات ولا يترك إلا قليلًا من الرماد. صُنع لشواء نهاية الأسبوع ومخيّم البرّ ومدخنة المجلس.",
    },
    town: "oyo",
    details: [
      { label: label.material, value: { en: "Mixed savannah hardwood, no binders or chemicals", ar: "أخشاب سافانا صلبة مختلطة، بلا مواد رابطة أو كيماويات" } },
      { label: label.burn, value: { en: "3–4 hours at grilling heat", ar: "3–4 ساعات بحرارة الشواء" } },
      { label: label.storage, value: { en: "Keep dry, off the floor.", ar: "يُحفظ جافًا ومرفوعًا عن الأرض." } },
    ],
    images: ["/images/products/charcoal-1.jpg", "/images/products/charcoal-2.jpg"],
    variants: [
      { id: "10kg", label: { en: "10kg sack", ar: "كيس 10 كغ" }, price: 75_00 },
      { id: "20kg", label: { en: "20kg sack", ar: "كيس 20 كغ" }, price: 139_00 },
    ],
    featured: 4,
  },
  {
    slug: "ayin-hardwood-charcoal",
    category: "hearth",
    name: { en: "Ayin Hardwood Charcoal", ar: "فحم خشب الأيين" },
    tagline: { en: "Single-species, restaurant grade", ar: "من نوع خشب واحد، بجودة المطاعم" },
    story: {
      en: "Charcoal made only from ayin (Anogeissus leiocarpus), the iron-hard tree prized across West Africa for the hottest, longest fires. Dense, ringing pieces that barely spark and burn for hours. The choice of grill chefs.",
      ar: "فحم مصنوع من خشب الأيين فقط، الشجرة الصلبة كالحديد التي تُقدَّر في غرب أفريقيا لأشد النيران حرارة وأطولها. قطع كثيفة يرنّ صوتها بالكاد تتطاير منها الشرر وتشتعل لساعات. اختيار طهاة الشواء.",
    },
    town: "kwara",
    details: [
      { label: label.material, value: { en: "100% Anogeissus leiocarpus hardwood", ar: "100٪ خشب الأيين الصلب" } },
      { label: label.burn, value: { en: "5+ hours at grilling heat", ar: "أكثر من 5 ساعات بحرارة الشواء" } },
      { label: label.storage, value: { en: "Keep dry, off the floor.", ar: "يُحفظ جافًا ومرفوعًا عن الأرض." } },
    ],
    images: ["/images/products/ayin-1.jpg", "/images/products/ayin-2.jpg"],
    variants: [
      { id: "10kg", label: { en: "10kg sack", ar: "كيس 10 كغ" }, price: 95_00 },
      { id: "20kg", label: { en: "20kg sack", ar: "كيس 20 كغ" }, price: 179_00 },
    ],
    badge: badges.chef,
  },

  // ——— Arts & Crafts ———
  {
    slug: "adire-eleko-indigo-cloth",
    category: "crafts",
    name: { en: "Adire Eleko Indigo Cloth", ar: "قماش أديري إليكو النيلي" },
    tagline: { en: "Hand-painted resist, natural indigo", ar: "رسم يدوي مقاوم للصبغ ونيلة طبيعية" },
    story: {
      en: "Adire is the indigo cloth of the Yoruba, and Abeokuta is its home. Patterns are painted freehand with cassava paste, then the cloth is dipped again and again in fermented indigo vats until it reaches this deep, inky blue. No two lengths are alike.",
      ar: "الأديري هو قماش اليوروبا النيلي، وأبيوكوتا موطنه. تُرسم الزخارف يدويًا بعجينة الكسافا، ثم يُغمس القماش مرة تلو الأخرى في أحواض النيلة المخمّرة حتى يبلغ هذا الأزرق العميق كالحبر. لا تتشابه قطعتان أبدًا.",
    },
    town: "abeokuta",
    details: [
      { label: label.material, value: { en: "Cotton, natural indigo", ar: "قطن، نيلة طبيعية" } },
      { label: label.technique, value: { en: "Eleko: cassava-paste resist, hand-painted", ar: "إليكو: رسم يدوي بعجينة الكسافا المقاومة" } },
      { label: label.care, value: { en: "Wash cold and alone; dry in shade.", ar: "يُغسل بماء بارد منفردًا ويُجفف في الظل." } },
    ],
    images: ["/images/products/adire-1.jpg", "/images/products/adire-2.jpg"],
    variants: [
      { id: "2yd", label: { en: "2 yards", ar: "ياردتان" }, price: 220_00 },
      { id: "4yd", label: { en: "4 yards", ar: "4 ياردات" }, price: 395_00 },
    ],
    featured: 6,
    handmade: true,
  },
  {
    slug: "hand-loomed-aso-oke",
    category: "crafts",
    name: { en: "Hand-loomed Aso-Oke", ar: "أسو أوكي المنسوج يدويًا" },
    tagline: { en: "Narrow-strip weave from Iseyin", ar: "نسيج الشرائط الضيقة من إسيين" },
    story: {
      en: "Aso-oke, 'top cloth', is woven on narrow horizontal looms in Iseyin, then the strips are sewn edge to edge. It is the cloth of Yoruba weddings and celebrations: crisp, substantial and catching the light. Sold as a gele head-tie or as a full iro and gele set.",
      ar: "أسو أوكي، أي «القماش الأعلى»، يُنسج على أنوال أفقية ضيقة في إسيين، ثم تُخاط الشرائط جنبًا إلى جنب. إنه قماش أعراس اليوروبا واحتفالاتهم: متماسك ووافر ويلتقط الضوء. يُباع كغطاء رأس «جيلي» أو كطقم كامل من «إيرو» و«جيلي».",
    },
    town: "iseyin",
    details: [
      { label: label.material, value: { en: "Cotton and lurex, hand-woven", ar: "قطن وخيوط لامعة، منسوج يدويًا" } },
      { label: label.technique, value: { en: "Narrow-strip horizontal loom", ar: "نول أفقي للشرائط الضيقة" } },
      { label: label.care, value: { en: "Dry clean only.", ar: "تنظيف جاف فقط." } },
    ],
    images: ["/images/products/asooke-1.jpg", "/images/products/asooke-2.jpg"],
    variants: [
      { id: "gele", label: { en: "Gele head-tie", ar: "غطاء رأس جيلي" }, price: 260_00 },
      { id: "iro-gele", label: { en: "Iro & gele set", ar: "طقم إيرو وجيلي" }, price: 680_00 },
    ],
    handmade: true,
  },
  {
    slug: "ankara-wax-print",
    category: "crafts",
    name: { en: "Ankara Wax Print", ar: "قماش أنقرة المطبوع بالشمع" },
    tagline: { en: "Six yards, bold and bright", ar: "ست ياردات، جريء ونابض بالألوان" },
    story: {
      en: "The vivid wax-resist prints that dress Lagos. Each six-yard piece is chosen by hand at Balogun market for the depth of its colour and the crispness of its print, enough for a dress, a shirt and a little left over.",
      ar: "أقمشة الطباعة بالشمع الزاهية التي تكسو لاغوس. تُنتقى كل قطعة من ست ياردات يدويًا في سوق بالوغون لعمق ألوانها ووضوح طبعتها، وتكفي لفستان وقميص ويبقى منها القليل.",
    },
    town: "lagos",
    details: [
      { label: label.material, value: { en: "100% cotton, wax-resist print", ar: "100٪ قطن، طباعة بالشمع" } },
      { label: label.dimensions, value: { en: "6 yards × 46 inches", ar: "6 ياردات × 46 بوصة" } },
      { label: label.care, value: { en: "Wash cold, inside out.", ar: "يُغسل بماء بارد مقلوبًا." } },
    ],
    images: ["/images/products/ankara-1.jpg", "/images/products/ankara-2.jpg"],
    variants: [{ id: "6yd", label: { en: "6 yards", ar: "6 ياردات" }, price: 145_00 }],
  },
  {
    slug: "kano-leather-pouf",
    category: "crafts",
    name: { en: "Kano Leather Pouf", ar: "بوف جلدي من كانو" },
    tagline: { en: "Goatskin, hand-stitched", ar: "جلد ماعز، مخيط يدويًا" },
    story: {
      en: "Kano has been a centre of leatherwork for centuries. This pouf is cut from vegetable-tanned goatskin and stitched by hand with a radiating star, then filled firm so it works as a footrest, a side table or an extra seat in the majlis.",
      ar: "كانت كانو مركزًا لصناعة الجلود منذ قرون. يُقصّ هذا البوف من جلد ماعز مدبوغ نباتيًا ويُخاط يدويًا بنجمة مشعّة، ثم يُحشى بإحكام ليكون مسندًا للقدمين أو طاولة جانبية أو مقعدًا إضافيًا في المجلس.",
    },
    town: "kano",
    details: [
      { label: label.material, value: { en: "Vegetable-tanned goatskin, cotton thread", ar: "جلد ماعز مدبوغ نباتيًا، خيط قطني" } },
      { label: label.dimensions, value: { en: "50cm diameter × 35cm high", ar: "قطر 50 سم × ارتفاع 35 سم" } },
      { label: label.care, value: { en: "Wipe with a dry cloth; keep out of direct sun.", ar: "يُمسح بقطعة قماش جافة، ويُبعد عن الشمس المباشرة." } },
    ],
    images: ["/images/products/pouf-1.jpg", "/images/products/pouf-2.jpg"],
    variants: [{ id: "filled", label: { en: "Filled", ar: "محشو" }, price: 650_00 }],
    featured: 7,
    handmade: true,
  },
  {
    slug: "ife-style-bronze-head",
    category: "crafts",
    name: { en: "Ife-style Bronze Head", ar: "رأس برونزي على طراز إيفي" },
    tagline: { en: "Lost-wax cast, signed by the foundry", ar: "مصبوب بالشمع المفقود، بتوقيع المسبك" },
    story: {
      en: "A contemporary homage to the classical heads of Ile-Ife, cast by a family foundry using the lost-wax method: each head is modelled in wax, encased in clay and cast in bronze, so the mould is broken and no two are identical. Signed and numbered.",
      ar: "تحية معاصرة لرؤوس إيلي-إيفي الكلاسيكية، يصبّها مسبك عائلي بطريقة الشمع المفقود: يُشكَّل كل رأس من الشمع ويُغلَّف بالطين ثم يُصبّ بالبرونز، فيُكسر القالب ولا يتطابق رأسان أبدًا. موقّع ومرقّم.",
    },
    town: "benin-city",
    details: [
      { label: label.material, value: { en: "Bronze, hand-finished patina", ar: "برونز بلمسة نهائية يدوية" } },
      { label: label.dimensions, value: { en: "30cm high, approx. 4kg", ar: "ارتفاع 30 سم، نحو 4 كغ" } },
      { label: label.technique, value: { en: "Lost-wax casting", ar: "الصبّ بالشمع المفقود" } },
    ],
    images: ["/images/products/bronze-head-1.jpg", "/images/products/bronze-head-2.jpg"],
    variants: [{ id: "30cm", label: { en: "30cm", ar: "30 سم" }, price: 1450_00 }],
    badge: badges.limited,
    featured: 8,
    handmade: true,
  },
  {
    slug: "mother-and-child-bronze",
    category: "crafts",
    name: { en: "Mother & Child Bronze", ar: "تمثال برونزي: الأم والطفل" },
    tagline: { en: "Slender lost-wax figure from Bida", ar: "مجسّم نحيل بالشمع المفقود من بيدا" },
    story: {
      en: "Bida's brass and bronze smiths are known for elegant, elongated figures. This mother carries her child on her back in the way of the region, her wrap finished in a soft green patina.",
      ar: "يشتهر حدادو النحاس والبرونز في بيدا بمجسّماتهم الأنيقة الممشوقة. تحمل هذه الأم طفلها على ظهرها كعادة أهل المنطقة، ولفافتها مكسوّة بلمعة خضراء ناعمة.",
    },
    town: "bida",
    details: [
      { label: label.material, value: { en: "Bronze on bronze base", ar: "برونز على قاعدة برونزية" } },
      { label: label.dimensions, value: { en: "38cm high", ar: "ارتفاع 38 سم" } },
      { label: label.technique, value: { en: "Lost-wax casting, hand-applied patina", ar: "صبّ بالشمع المفقود ولمعة يدوية" } },
    ],
    images: ["/images/products/figurine-1.jpg"],
    variants: [{ id: "38cm", label: { en: "38cm", ar: "38 سم" }, price: 480_00 }],
    handmade: true,
  },
  {
    slug: "hand-carved-wall-mask",
    category: "crafts",
    name: { en: "Hand-carved Wall Mask", ar: "قناع جداري منحوت يدويًا" },
    tagline: { en: "Carved, pigmented and hung", ar: "منحوت وملوّن وجاهز للتعليق" },
    story: {
      en: "Carved from a single block of seasoned wood by carvers in Oyo, then painted with mineral pigments and inlaid with metal. Made as a decorative piece for the wall, in the spirit of the region's festival masks.",
      ar: "منحوت من كتلة واحدة من الخشب المعالَج على أيدي نحّاتين في أويو، ثم يُلوَّن بأصباغ معدنية ويُطعَّم بالمعدن. صُنع كقطعة زخرفية للجدار بروح أقنعة المهرجانات في المنطقة.",
    },
    town: "oyo",
    details: [
      { label: label.material, value: { en: "Seasoned hardwood, mineral pigment, metal inlay", ar: "خشب صلب معالَج، أصباغ معدنية، تطعيم معدني" } },
      { label: label.dimensions, value: { en: "45cm high", ar: "ارتفاع 45 سم" } },
    ],
    images: ["/images/products/mask-1.jpg", "/images/products/mask-2.jpg"],
    variants: [{ id: "45cm", label: { en: "45cm", ar: "45 سم" }, price: 340_00 }],
    handmade: true,
  },
  {
    slug: "terracotta-water-pot",
    category: "crafts",
    name: { en: "Terracotta Water Pot", ar: "جرة ماء فخارية" },
    tagline: { en: "Hand-coiled, open-fired", ar: "مشكّلة يدويًا ومحروقة في نار مكشوفة" },
    story: {
      en: "Coiled by hand by women potters in Ilorin and fired in the open with grass and wood. Porous clay keeps water naturally cool through evaporation, a quiet piece of engineering that is just as beautiful holding dried palms.",
      ar: "تشكّلها يدويًا خزّافات في إلورن بطريقة الحبال الطينية، وتُحرق في نار مكشوفة من العشب والحطب. الطين المسامي يحفظ الماء باردًا بالتبخر، هندسة هادئة تبدو جميلة بالقدر نفسه وهي تحمل سعف النخيل المجفف.",
    },
    town: "ilorin",
    details: [
      { label: label.material, value: { en: "Local terracotta clay", ar: "طين فخار محلي" } },
      { label: label.dimensions, value: { en: "Medium 35cm · Large 50cm", ar: "متوسطة 35 سم · كبيرة 50 سم" } },
      { label: label.care, value: { en: "Soak overnight before first use.", ar: "تُنقع ليلة كاملة قبل الاستخدام الأول." } },
    ],
    images: ["/images/products/pot-1.jpg", "/images/products/pot-2.jpg"],
    variants: [
      { id: "medium", label: { en: "Medium", ar: "متوسطة" }, price: 280_00 },
      { id: "large", label: { en: "Large", ar: "كبيرة" }, price: 420_00 },
    ],
    handmade: true,
  },
  {
    slug: "bida-glass-bead-strands",
    category: "crafts",
    name: { en: "Bida Glass Bead Strands", ar: "عقود خرز زجاجي من بيدا" },
    tagline: { en: "Recycled glass, hand-wound", ar: "زجاج معاد تدويره، ملفوف يدويًا" },
    story: {
      en: "Bida's bead makers melt down old bottles and wind the glass by hand around iron rods over charcoal furnaces, a technique handed down for generations. Each strand mixes colours and sizes; wear them layered or hang them as a quiet splash of colour.",
      ar: "يصهر صنّاع الخرز في بيدا الزجاجات القديمة ويلفّون الزجاج يدويًا حول قضبان حديدية فوق أفران الفحم، تقنية متوارثة عبر الأجيال. يمزج كل عقد بين الألوان والأحجام؛ ارتدها متراكبة أو علّقها لمسة لون هادئة.",
    },
    town: "bida",
    details: [
      { label: label.material, value: { en: "Recycled glass, cotton cord", ar: "زجاج معاد تدويره، حبل قطني" } },
      { label: label.dimensions, value: { en: "Each strand approx. 60cm", ar: "طول كل عقد نحو 60 سم" } },
    ],
    images: ["/images/products/beads-1.jpg", "/images/products/beads-2.jpg"],
    variants: [
      { id: "set3", label: { en: "Set of 3", ar: "مجموعة من 3" }, price: 160_00 },
      { id: "set6", label: { en: "Set of 6", ar: "مجموعة من 6" }, price: 295_00 },
    ],
    handmade: true,
  },
  {
    slug: "woven-faifai-wall-platters",
    category: "crafts",
    name: { en: "Woven Faifai Wall Platters", ar: "أطباق فيفاي المنسوجة" },
    tagline: { en: "Set of three, coiled grass", ar: "مجموعة من ثلاثة، عشب ملفوف" },
    story: {
      en: "In northern Nigeria the faifai is a woven grass platter used to cover food and carry it to the table. Ours are coiled by hand in Kano in natural and dyed grasses, and look beautiful grouped on a wall.",
      ar: "في شمال نيجيريا، الفيفاي طبق منسوج من العشب يُستخدم لتغطية الطعام وحمله إلى المائدة. تُلفّ أطباقنا يدويًا في كانو من أعشاب طبيعية ومصبوغة، وتبدو جميلة مجتمعة على الجدار.",
    },
    town: "kano",
    details: [
      { label: label.material, value: { en: "Dried palm leaf and grass, natural dyes", ar: "سعف نخيل وعشب مجفف، أصباغ طبيعية" } },
      { label: label.dimensions, value: { en: "30cm, 40cm and 50cm", ar: "30 سم و40 سم و50 سم" } },
    ],
    images: ["/images/products/platters-1.jpg"],
    variants: [{ id: "set3", label: { en: "Set of 3", ar: "مجموعة من 3" }, price: 240_00 }],
    badge: badges.new,
    handmade: true,
  },
  {
    slug: "hand-carved-djembe",
    category: "crafts",
    name: { en: "Hand-carved Djembe", ar: "طبل جيمبي منحوت يدويًا" },
    tagline: { en: "Goatskin head, rope-tuned", ar: "رأس من جلد الماعز، يُضبط بالحبال" },
    story: {
      en: "Carved from a single log and topped with goatskin, tuned by hand with a rope lattice. A real instrument with a deep bass and a bright, cracking slap, and a handsome object when it is resting.",
      ar: "منحوت من جذع واحد ومغطّى بجلد الماعز، ويُضبط يدويًا بشبكة من الحبال. آلة حقيقية بصوت جهير عميق وضربة حادة ساطعة، وقطعة أنيقة حين تكون في سكونها.",
    },
    town: "oyo",
    details: [
      { label: label.material, value: { en: "Hardwood shell, goatskin head, nylon rope", ar: "جسم من الخشب الصلب، رأس من جلد الماعز، حبل نايلون" } },
      { label: label.dimensions, value: { en: "Medium 50cm · Large 60cm", ar: "متوسط 50 سم · كبير 60 سم" } },
    ],
    images: ["/images/products/drum-1.jpg", "/images/products/drum-2.jpg"],
    variants: [
      { id: "medium", label: { en: "Medium", ar: "متوسط" }, price: 595_00 },
      { id: "large", label: { en: "Large", ar: "كبير" }, price: 790_00 },
    ],
    handmade: true,
  },
];

// ——— Gift sets ———

const giftSets: SeedProduct[] = [
  {
    slug: "zobo-ritual-kit",
    category: "gifts",
    name: { en: "Zobo Ritual Kit", ar: "طقم الزوبو" },
    tagline: { en: "Hibiscus, Zanzibar cloves and a recipe card", ar: "كركديه وقرنفل زنجبار وبطاقة وصفة" },
    story: {
      en: "Everything for a jug of zobo, the West African karkadeh: 250g of sun-dried Kano hibiscus, 100g of whole Zanzibar cloves and a printed recipe card in English and Arabic. A thoughtful gift for Ramadan evenings.",
      ar: "كل ما تحتاجه لإبريق من الزوبو، كركديه غرب أفريقيا: 250 غرامًا من كركديه كانو المجفف بالشمس، و100 غرام من قرنفل زنجبار الكامل، وبطاقة وصفة مطبوعة بالعربية والإنجليزية. هدية لطيفة لأمسيات رمضان.",
    },
    town: "kano",
    details: [
      { label: { en: "Inside", ar: "المحتويات" }, value: { en: "Dried hibiscus 250g, whole cloves 100g, recipe card", ar: "كركديه مجفف 250 غ، قرنفل كامل 100 غ، بطاقة وصفة" } },
    ],
    images: ["/images/products/hibiscus-2.jpg", "/images/products/hibiscus-1.jpg", "/images/products/cloves-1.jpg"],
    variants: [{ id: "kit", label: { en: "Kit", ar: "طقم" }, price: 45_00 }],
    bundle: ["zobo-dried-hibiscus", "zanzibar-whole-cloves"],
    badge: { en: "Gift set", ar: "مجموعة هدايا" },
  },
  {
    slug: "majlis-grill-set",
    category: "gifts",
    name: { en: "Majlis Grill Set", ar: "طقم شواء المجلس" },
    tagline: { en: "Ayin charcoal and Kano suya spice", ar: "فحم الأيين وبهارات السويا من كانو" },
    story: {
      en: "A 10kg sack of restaurant-grade ayin charcoal and 300g of yaji suya spice: the long, clean heat and the smoky, peppery rub behind northern Nigeria's famous grilled skewers. Made for winter camps and weekend gatherings.",
      ar: "كيس 10 كغ من فحم الأيين بجودة المطاعم و300 غرام من بهارات السويا (ياجي): الحرارة الطويلة النظيفة والخلطة المدخّنة الحارة وراء أسياخ الشواء الشهيرة في شمال نيجيريا. صُنع لمخيمات الشتاء وتجمعات نهاية الأسبوع.",
    },
    town: "kwara",
    details: [
      { label: { en: "Inside", ar: "المحتويات" }, value: { en: "Ayin hardwood charcoal 10kg, yaji suya spice 300g", ar: "فحم خشب الأيين 10 كغ، بهارات السويا 300 غ" } },
    ],
    images: ["/images/products/ayin-1.jpg", "/images/products/yaji-1.jpg"],
    variants: [{ id: "set", label: { en: "Set", ar: "طقم" }, price: 125_00 }],
    bundle: ["ayin-hardwood-charcoal", "yaji-suya-spice"],
    badge: { en: "Gift set", ar: "مجموعة هدايا" },
  },
  {
    slug: "ramadan-eid-gift-box",
    category: "gifts",
    name: { en: "Ramadan & Eid Gift Box", ar: "صندوق هدايا رمضان والعيد" },
    tagline: { en: "Hibiscus, sesame and raw shea butter", ar: "كركديه وسمسم وزبدة شيا خام" },
    story: {
      en: "Three favourites from the house, wrapped in indigo paper with a handwritten card: 500g of Kano hibiscus, 500g of white benniseed sesame and 250g of raw shea butter. Ready to give, delivered anywhere in Qatar.",
      ar: "ثلاثة من أحبّ منتجات الدار، مغلّفة بورق نيلي مع بطاقة مكتوبة بخط اليد: 500 غرام من كركديه كانو، و500 غرام من سمسم بِنّيسيد الأبيض، و250 غرامًا من زبدة الشيا الخام. جاهزة للإهداء ونوصلها إلى أي مكان في قطر.",
    },
    town: "kano",
    details: [
      { label: { en: "Inside", ar: "المحتويات" }, value: { en: "Dried hibiscus 500g, white sesame 500g, shea butter 250g, gift card", ar: "كركديه مجفف 500 غ، سمسم أبيض 500 غ، زبدة شيا 250 غ، بطاقة إهداء" } },
    ],
    images: ["/images/products/hibiscus-3.jpg", "/images/products/sesame-1.jpg", "/images/products/shea-1.jpg"],
    variants: [{ id: "box", label: { en: "Gift box", ar: "صندوق هدايا" }, price: 99_00 }],
    bundle: ["zobo-dried-hibiscus", "benniseed-white-sesame", "raw-shea-butter"],
    badge: { en: "Gift set", ar: "مجموعة هدايا" },
    featured: 9,
  },
];

// ——— Weights and opening stock ———

const WEIGHT: Record<string, Record<string, number>> = {
  "zobo-dried-hibiscus": { "250g": 250, "500g": 500, "1kg": 1000 },
  "benniseed-white-sesame": { "500g": 500, "1kg": 1000 },
  "egusi-melon-seeds": { "500g": 500, "1kg": 1000 },
  "yaji-suya-spice": { "150g": 150, "300g": 300 },
  "moringa-leaf-powder": { "200g": 200, "500g": 500 },
  "zanzibar-whole-cloves": { "100g": 100, "250g": 250 },
  "raw-shea-butter": { "250g": 250, "500g": 500 },
  "ose-dudu-black-soap": { "200g": 200, "3x200g": 600 },
  "hardwood-lump-charcoal": { "10kg": 10000, "20kg": 20000 },
  "ayin-hardwood-charcoal": { "10kg": 10000, "20kg": 20000 },
  "adire-eleko-indigo-cloth": { "2yd": 600, "4yd": 1200 },
  "hand-loomed-aso-oke": { gele: 500, "iro-gele": 1500 },
  "ankara-wax-print": { "6yd": 1200 },
  "kano-leather-pouf": { filled: 4000 },
  "ife-style-bronze-head": { "30cm": 4000 },
  "mother-and-child-bronze": { "38cm": 2000 },
  "hand-carved-wall-mask": { "45cm": 1500 },
  "terracotta-water-pot": { medium: 4000, large: 8000 },
  "bida-glass-bead-strands": { set3: 300, set6: 600 },
  "woven-faifai-wall-platters": { set3: 1500 },
  "hand-carved-djembe": { medium: 6000, large: 9000 },
  "zobo-ritual-kit": { kit: 400 },
  "majlis-grill-set": { set: 10300 },
  "ramadan-eid-gift-box": { box: 1400 },
};

// Hand-made pieces come in small numbers; pantry goods by the case.
const STOCK_BY_CATEGORY: Record<string, number> = { pantry: 40, body: 30, hearth: 25, crafts: 4, gifts: 15 };
const STOCK: Record<string, Record<string, number>> = {
  "ife-style-bronze-head": { "30cm": 2 },
  "kano-leather-pouf": { filled: 3 },
  "hand-carved-djembe": { medium: 3, large: 1 },
  "terracotta-water-pot": { medium: 5, large: 2 },
  "ankara-wax-print": { "6yd": 12 },
  "bida-glass-bead-strands": { set3: 10, set6: 6 },
};

export const seedProducts: Product[] = [...base, ...giftSets].map((p) => ({
  ...p,
  variants: p.variants.map((v) => ({
    ...v,
    weight: WEIGHT[p.slug]?.[v.id] ?? 500,
    stock: STOCK[p.slug]?.[v.id] ?? STOCK_BY_CATEGORY[p.category] ?? null,
  })),
}));
