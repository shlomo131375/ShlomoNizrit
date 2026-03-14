"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

export type Language = "he" | "en";

interface LanguageContextType {
  lang: Language;
  toggleLanguage: () => void;
  t: (key: string) => string;
  dir: "rtl" | "ltr";
}

const translations: Record<string, Record<Language, string>> = {
  // Header
  "nav.home": { he: "ראשי", en: "Home" },
  "nav.scripts": { he: "סקריפטים", en: "Scripts" },
  "nav.about": { he: "אודות", en: "About" },
  "nav.contact": { he: "צור קשר", en: "Contact" },

  // Homepage
  "hero.title1": { he: "סקריפטים מקצועיים", en: "Professional Scripts" },
  "hero.title2": { he: "לאדובי אינדיזיין", en: "for Adobe InDesign" },
  "hero.subtitle": { he: "כלים אוטומטיים שנבנו מתוך ניסיון אמיתי בעימוד.\nמה שלוקח שעות — ייקח שניות.", en: "Automation tools built from real typesetting experience.\nWhat takes hours — takes seconds." },
  "hero.cta": { he: "לכל הסקריפטים", en: "View All Scripts" },
  "hero.learn": { he: "למד עוד", en: "Learn More" },
  "stats.scripts": { he: "סקריפטים", en: "Scripts" },
  "stats.customers": { he: "לקוחות", en: "Customers" },
  "stats.hours": { he: "שעות נחסכות", en: "Hours Saved" },
  "home.categories": { he: "קטגוריות", en: "Categories" },
  "home.scriptsCount": { he: "סקריפטים", en: "scripts" },
  "home.featured": { he: "מוצרים מובילים", en: "Featured Products" },
  "home.all": { he: "הכל", en: "All" },
  "home.free": { he: "חינם", en: "Free" },
  "home.whyUs": { he: "למה אנחנו", en: "Why Us" },
  "home.timeSaving": { he: "חיסכון בזמן", en: "Time Saving" },
  "home.timeSavingDesc": { he: "אוטומציה של משימות חוזרות. מה שלוקח שעות, ייקח שניות.", en: "Automation of repetitive tasks. What takes hours, takes seconds." },
  "home.fromField": { he: "מהשטח", en: "Field Tested" },
  "home.fromFieldDesc": { he: "כל סקריפט נבנה מתוך ניסיון אמיתי בעבודת עימוד יומיומית.", en: "Every script is built from real daily typesetting experience." },
  "home.licensing": { he: "תמיכה", en: "Support" },
  "home.licensingDesc": { he: "תמיכה ועדכונים שוטפים.", en: "Support and regular updates." },
  "home.ctaTitle": { he: "מוכן לייעל את העבודה?", en: "Ready to Boost Productivity?" },
  "home.ctaSubtitle": { he: "הצטרף למעצבים שכבר חוסכים שעות עבודה", en: "Join designers who already save hours of work" },
  "home.ctaButton": { he: "לסקריפטים", en: "View Scripts" },

  // Catalog
  "catalog.title": { he: "סקריפטים", en: "Scripts" },
  "catalog.subtitle": { he: "סקריפטים מקצועיים לאדובי אינדיזיין", en: "professional scripts for Adobe InDesign" },
  "catalog.search": { he: "חיפוש...", en: "Search..." },
  "catalog.sortName": { he: "לפי שם", en: "By Name" },
  "catalog.sortPriceAsc": { he: "מחיר: נמוך לגבוה", en: "Price: Low to High" },
  "catalog.sortPriceDesc": { he: "מחיר: גבוה לנמוך", en: "Price: High to Low" },
  "catalog.results": { he: "תוצאות", en: "results" },
  "catalog.noResults": { he: "לא נמצאו תוצאות", en: "No Results Found" },
  "catalog.noResultsDesc": { he: "נסה לשנות את החיפוש או הקטגוריה", en: "Try changing your search or category" },

  // Categories
  "cat.all": { he: "הכל", en: "All" },
  "cat.עימוד": { he: "עימוד", en: "Typesetting" },
  "cat.ניווט": { he: "ניווט", en: "Navigation" },
  "cat.ייצוא": { he: "ייצוא", en: "Export" },
  "cat.עיצוב": { he: "עיצוב", en: "Design" },

  // ScriptCard
  "card.free": { he: "חינם", en: "Free" },
  "card.download": { he: "הורדה", en: "Download" },
  "card.inCart": { he: "בעגלה", en: "In Cart" },
  "card.addToCart": { he: "הוסף לעגלה", en: "Add to Cart" },

  // Product page
  "product.notFound": { he: "הסקריפט לא נמצא", en: "Script not found" },
  "product.backToScripts": { he: "חזרה לסקריפטים", en: "Back to Scripts" },
  "product.home": { he: "ראשי", en: "Home" },
  "product.description": { he: "תיאור", en: "Description" },
  "product.details": { he: "פרטים", en: "Details" },
  "product.file": { he: "קובץ", en: "File" },
  "product.version": { he: "גרסה", en: "Version" },
  "product.category": { he: "קטגוריה", en: "Category" },
  "product.compatibility": { he: "תאימות", en: "Compatibility" },
  "product.noVideo": { he: "אין סרטון הדגמה", en: "No demo video" },
  "product.downloadFree": { he: "הורדה חינם", en: "Free Download" },
  "product.inCartCheckout": { he: "בעגלה — לתשלום", en: "In Cart — Checkout" },
  "product.instantDownload": { he: "הורדה מיידית אחרי רכישה", en: "Instant download after purchase" },
  "product.freeUpdates": { he: "עדכונים חינם", en: "Free updates" },
  "product.personalSupport": { he: "תמיכה אישית", en: "Personal support" },
  "product.singleLicense": { he: "רישוי למחשב אחד", en: "Single computer license" },
  "product.related": { he: "סקריפטים דומים", en: "Related Scripts" },

  // Cart
  "cart.empty": { he: "העגלה ריקה", en: "Cart is Empty" },
  "cart.emptyDesc": { he: "לא הוספת עדיין סקריפטים", en: "You haven't added any scripts yet" },
  "cart.title": { he: "עגלת קניות", en: "Shopping Cart" },
  "cart.products": { he: "מוצרים", en: "Products" },
  "cart.total": { he: 'סה"כ', en: "Total" },
  "cart.checkout": { he: "לתשלום", en: "Checkout" },
  "cart.clear": { he: "נקה", en: "Clear" },
  "cart.continue": { he: "המשך בקניות", en: "Continue Shopping" },

  // Checkout
  "checkout.emptyCart": { he: "העגלה ריקה", en: "Cart is Empty" },
  "checkout.backToCart": { he: "חזרה לעגלה", en: "Back to Cart" },
  "checkout.title": { he: "תשלום", en: "Checkout" },
  "checkout.personalInfo": { he: "פרטים אישיים", en: "Personal Details" },
  "checkout.fullName": { he: "שם מלא", en: "Full Name" },
  "checkout.email": { he: "אימייל", en: "Email" },
  "checkout.phone": { he: "טלפון", en: "Phone" },
  "checkout.payment": { he: "תשלום", en: "Payment" },
  "checkout.paymentNote": { he: "מערכת סליקה תחובר בקרוב.\nההזמנה נשמרת ותטופל ידנית.", en: "Payment system coming soon.\nOrders are saved and processed manually." },
  "checkout.submit": { he: "שלח הזמנה", en: "Submit Order" },
  "checkout.summary": { he: "סיכום", en: "Summary" },
  "checkout.orderReceived": { he: "ההזמנה התקבלה", en: "Order Received" },
  "checkout.confirmSent": { he: "אישור נשלח ל-", en: "Confirmation sent to " },
  "checkout.willContact": { he: "ניצור קשר בהקדם עם פרטי ההורדה", en: "We'll contact you soon with download details" },
  "checkout.backToSite": { he: "חזרה לאתר", en: "Back to Site" },

  // About
  "about.title": { he: "Shlomo Nizrit", en: "Shlomo Nizrit" },
  "about.subtitle": { he: "סקריפטים מקצועיים לאדובי אינדיזיין, שנוצרו מתוך צורך אמיתי בעבודה יומיומית", en: "Professional Adobe InDesign scripts, born from real daily workflow needs" },
  "about.story": { he: "הסיפור", en: "The Story" },
  "about.story1": { he: "Shlomo Nizrit נולד מתוך עבודת עימוד יומיומית. כמעצב גרפי שעובד עם אדובי אינדיזיין, נתקלתי שוב ושוב במשימות חוזרות ומעייפות — החלפת סגנונות, ניווט במסמכים ארוכים, ייצוא מרובה, ועוד.", en: "Shlomo Nizrit was born from daily typesetting work. As a graphic designer working with Adobe InDesign, I kept encountering repetitive, tedious tasks — replacing styles, navigating long documents, multiple exports, and more." },
  "about.story2": { he: "במקום להמשיך לבזבז זמן, החלטתי לכתוב סקריפטים שיעשו את העבודה בשבילי. מהר מאוד הבנתי שגם מעצבים אחרים סובלים מאותן בעיות — וככה נולד הפרויקט.", en: "Instead of continuing to waste time, I decided to write scripts to do the work for me. I quickly realized that other designers suffer from the same problems — and that's how the project was born." },
  "about.story3": { he: "כל סקריפט נבנה בקפידה, עם ממשק משתמש ברור בעברית, ועם גמישות מירבית כדי להתאים לכמה שיותר תרחישי עבודה.", en: "Every script is carefully built, with a clear Hebrew user interface, and maximum flexibility to fit as many workflow scenarios as possible." },
  "about.statsScripts": { he: "סקריפטים", en: "Scripts" },
  "about.statsCustomers": { he: "לקוחות", en: "Customers" },
  "about.statsExperience": { he: "שנות ניסיון", en: "Years Experience" },
  "about.whatSetsUsApart": { he: "מה מבדיל אותנו", en: "What Sets Us Apart" },
  "about.fromField": { he: "נוצר מהשטח", en: "Built from the Field" },
  "about.fromFieldDesc": { he: "כל סקריפט נולד מצורך אמיתי בעבודה יומיומית, לא מנחישות תיאורטית.", en: "Every script comes from a real daily work need, not theoretical guessing." },
  "about.hebrewUI": { he: "ממשק בעברית", en: "Hebrew Interface" },
  "about.hebrewUIDesc": { he: "כל הסקריפטים עם ממשק בעברית מלאה, מותאמים למשתמש הישראלי.", en: "All scripts feature a full Hebrew interface, tailored for Israeli users." },
  "about.updates": { he: "עדכונים ותמיכה", en: "Updates & Support" },
  "about.updatesDesc": { he: "תמיכה אישית ועדכונים שוטפים. כי הסקריפט צריך לעבוד מושלם.", en: "Personal support and regular updates. Because the script must work perfectly." },
  "about.cta": { he: "לסקריפטים", en: "View Scripts" },

  // Contact
  "contact.title": { he: "צור קשר", en: "Contact Us" },
  "contact.subtitle": { he: "שאלות, הצעות, או בעיה טכנית — נשמח לעזור", en: "Questions, suggestions, or technical issues — we're happy to help" },
  "contact.info": { he: "פרטי קשר", en: "Contact Info" },
  "contact.emailLabel": { he: "אימייל", en: "Email" },
  "contact.phoneLabel": { he: "טלפון", en: "Phone" },
  "contact.whatsapp": { he: "וואטסאפ", en: "WhatsApp" },
  "contact.whatsappAction": { he: "שלח הודעה", en: "Send Message" },
  "contact.hours": { he: "שעות פעילות", en: "Business Hours" },
  "contact.sunThu": { he: "ראשון - חמישי", en: "Sunday - Thursday" },
  "contact.fri": { he: "שישי", en: "Friday" },
  "contact.sat": { he: "שבת", en: "Saturday" },
  "contact.closed": { he: "סגור", en: "Closed" },
  "contact.name": { he: "שם", en: "Name" },
  "contact.namePlaceholder": { he: "השם שלך", en: "Your name" },
  "contact.emailPlaceholder": { he: "email@example.com", en: "email@example.com" },
  "contact.message": { he: "הודעה", en: "Message" },
  "contact.messagePlaceholder": { he: "במה נוכל לעזור?", en: "How can we help?" },
  "contact.send": { he: "שלח", en: "Send" },
  "contact.sent": { he: "ההודעה נשלחה", en: "Message Sent" },
  "contact.sentDesc": { he: "נחזור אליך בהקדם", en: "We'll get back to you soon" },

  // Footer
  "footer.desc": { he: "סקריפטים מקצועיים לאדובי אינדיזיין.\nנבנו מתוך ניסיון עשיר בעימוד ועיצוב גרפי.", en: "Professional scripts for Adobe InDesign.\nBuilt from extensive typesetting and graphic design experience." },
  "footer.nav": { he: "ניווט", en: "Navigation" },
  "footer.contact": { he: "יצירת קשר", en: "Contact" },

  // Reviews
  "reviews.title": { he: "ביקורות", en: "Reviews" },
  "reviews.count": { he: "ביקורות", en: "reviews" },
  "reviews.write": { he: "כתוב ביקורת", en: "Write a Review" },
  "reviews.yourRating": { he: "הדירוג שלך", en: "Your Rating" },
  "reviews.yourComment": { he: "הביקורת שלך", en: "Your Review" },
  "reviews.commentPlaceholder": { he: "שתף את החוויה שלך עם הסקריפט...", en: "Share your experience with this script..." },
  "reviews.displayAs": { he: "הצג את השם שלי בתור", en: "Display my name as" },
  "reviews.realName": { he: "השם שלי", en: "My name" },
  "reviews.customName": { he: "שם אחר", en: "Custom name" },
  "reviews.anonymous": { he: "אנונימי", en: "Anonymous" },
  "reviews.enterName": { he: "הכנס שם להצגה...", en: "Enter display name..." },
  "reviews.submit": { he: "פרסם ביקורת", en: "Submit Review" },
  "reviews.cancel": { he: "ביטול", en: "Cancel" },
  "reviews.ratingRequired": { he: "בחר דירוג", en: "Please select a rating" },
  "reviews.commentRequired": { he: "כתוב ביקורת", en: "Please write a review" },
  "reviews.alreadyReviewed": { he: "כבר כתבת ביקורת לסקריפט הזה", en: "You already reviewed this script" },
  "reviews.noReviews": { he: "עדיין אין ביקורות. היה הראשון!", en: "No reviews yet. Be the first!" },
  "reviews.loginToReview": { he: "התחבר כדי לכתוב ביקורת", en: "Log in to write a review" },
  "reviews.login": { he: "התחבר", en: "Log in" },
  "reviews.showAll": { he: "הצג את כל הביקורות", en: "Show all reviews" },

  // Common
  "loading": { he: "טוען...", en: "Loading..." },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>("he");

  useEffect(() => {
    const saved = localStorage.getItem("lang") as Language | null;
    if (saved === "en" || saved === "he") {
      setLang(saved);
      document.documentElement.lang = saved;
      document.documentElement.dir = saved === "he" ? "rtl" : "ltr";
    }
  }, []);

  const toggleLanguage = useCallback(() => {
    setLang((prev) => {
      const next = prev === "he" ? "en" : "he";
      localStorage.setItem("lang", next);
      document.documentElement.lang = next;
      document.documentElement.dir = next === "he" ? "rtl" : "ltr";
      return next;
    });
  }, []);

  const t = useCallback(
    (key: string): string => {
      return translations[key]?.[lang] ?? key;
    },
    [lang]
  );

  const dir = lang === "he" ? "rtl" : "ltr";

  return (
    <LanguageContext.Provider value={{ lang, toggleLanguage, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
}
