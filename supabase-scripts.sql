-- Create scripts table
CREATE TABLE scripts (
  id TEXT PRIMARY KEY,
  script_name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  price INTEGER DEFAULT NULL,  -- NULL = free
  version TEXT NOT NULL DEFAULT '1.0.1',
  download_url TEXT NOT NULL,
  icon TEXT DEFAULT NULL,
  video_url TEXT DEFAULT NULL,
  sort_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE scripts ENABLE ROW LEVEL SECURITY;

-- Everyone can read active scripts
CREATE POLICY "Anyone can read active scripts"
  ON scripts FOR SELECT
  USING (active = true);

-- Full access policy (for admin operations via anon key)
CREATE POLICY "Full access for all operations"
  ON scripts FOR ALL
  USING (true)
  WITH CHECK (true);

-- Insert existing scripts data
INSERT INTO scripts (id, script_name, display_name, description, category, price, version, download_url, icon, video_url, sort_order) VALUES
('header-footnotes', 'כותרת להערות שוליים.jsx', 'כותרת הערות שוליים', 'מאפשר לבחור אלמנט ולמקמו בכותרת הערות שוליים', 'עימוד', 250, '1.0.2', 'https://drive.google.com/uc?export=download&id=1apnk-tlsLqMSV_Yy9_u23miRLPECWGHJ', NULL, 'https://youtu.be/bzFUIaR4tBA', 1),
('style-replacer', 'מחליף סגנון בסגנון.jsx', 'מחליף סגנון בסגנון', 'מוסיף אופציה לתפריט סגנונות הפסקה ולהחליף סגנון בסגנון', 'עימוד', 200, '1.0.1', 'https://drive.google.com/uc?export=download&id=19pjlYtGMCFNMszu7cKvXsd3rDKOvt1Ig', NULL, 'https://youtu.be/XKgL6EI07RE', 2),
('paragraph-fit', 'התאמת פסקה.jsx', 'התאמת פסקה', 'מאפשר להוסיף/להחסיר שורה מפסקה ולטפל במילים בודדות', 'עימוד', 200, '1.0.1', 'https://drive.google.com/uc?export=download&id=13S10eUvkxACINITo1tU1dZmCsxkeyQMT', NULL, 'https://youtu.be/_6erpLU-YUk', 3),
('side-header', 'כותרת צד.jsx', 'כותרת צד', 'מאפשר ליצור כותרת צד לפי סגנון תו עם גמישות מירבית', 'עימוד', 200, '1.0.1', 'https://drive.google.com/uc?export=download&id=1d-EwPqv5kl2CdF9dNaX8O5Mr0LL2WAXI', NULL, NULL, 4),
('apply-master', 'מחיל מאסטר.jsx', 'מחיל מאסטר', 'מאפשר להחיל מאסטר לפי סגנון פסקה עם גמישות מירבית', 'עימוד', 100, '1.0.4', 'https://drive.google.com/uc?export=download&id=1E-TcfGyuoA_CoyYbv3bI3vOfiJfBr4TW', NULL, 'https://youtu.be/pePHapwDxWQ', 5),
('navigator', 'נווטן.jsx', 'נווטן', 'מאפשר לנווט לפי סגנונות', 'ניווט', 100, '1.0.1', 'https://drive.google.com/uc?export=download&id=1GiqW3_XLovtI4Oy_XoYFm-hAggGmaia4', NULL, 'https://youtu.be/WXQxJPANimw', 6),
('enlarge', 'הגדל.jsx', 'הגדל', 'מאפשר להגדיל ולמספר מספור לפי סגנון תו עם גמישות מירבית', 'עימוד', 300, '1.0.1', 'https://drive.google.com/uc?export=download&id=1dT2TM1JOX_lps4R7MgERtlcO4v-w-rsq', NULL, 'https://youtu.be/7wL-Zp9rDaU', 7),
('shortener', 'המקצר.jsx', 'המקצר', 'מאפשר לייבא בקלות כמות של קבצי וורד ולשייכם למסגרות טקסט ספציפיות עם גמישות מירבית', 'עימוד', 300, '1.0.5', 'https://drive.google.com/uc?export=download&id=1CHYVib6yG2yKl57xTARSLBH132iotIqr', NULL, 'https://youtu.be/AdT3yXlmxPg?si=eZUeYfPRI35kUTcL', 8),
('text-replacer', 'מחליף טקסט.jsx', 'מחליף טקסט', 'מאפשר להחליף טקסט בסגנון תו לפי קובץ טקסט משודרג לתמוך בסקריפט אוטומציה', 'עימוד', 50, '1.0.3', 'https://drive.google.com/uc?export=download&id=1_XLWMyRsDd8So7yAj7zSsj3oMKKz_Svy', NULL, NULL, 9),
('master-nav', 'ניווט מאסטר.jsx', 'ניווט מאסטר', 'מאפשר לנווט במסמך לפי מאסטרים', 'ניווט', NULL, '1.0.1', 'https://drive.google.com/uc?export=download&id=1eOsiMdiAhyAGcriOkqBt5za8G5ofU93e', NULL, 'https://youtu.be/Q5s12fZ0yAk', 10),
('line-navigator', 'ניווט לפי שורות.jsx', 'ניווט לפי שורות', 'מאפשר לנווט במסמך לפי פסקה שיש בה כמות מסויימת של שורות בסגנון מסויים', 'ניווט', 50, '1.0.2', 'https://drive.google.com/uc?export=download&id=1ppKF-belwiGJ4Q27lb1zjlqiUbsLKcyI', NULL, 'https://youtu.be/KK96Y4Bg5VI', 11),
('paragraph-end', 'סוף פסקה.jsx', 'סוף פסקה', 'מאפשר לשנות סוג יישור/סגנון אחר לפסקה שיש כמות שורות מסויימת ומטה/ומעלה', 'עימוד', 50, '1.0.1', 'https://drive.google.com/uc?export=download&id=11rwYNQwPnDZpOlVR5jmdTSYImvygQi6m', NULL, 'https://youtu.be/pki8pfQgG-0', 12),
('multi-preset-export', 'ייצוא מרובה פריסטים.jsx', 'ייצוא מרובה פריסטים', 'מאפשר לייצא לPDF מהסמך הפעיל לכמה וכמה פריסטים לכל אחד לנתיב משלו, ומאפשר לשמור את ההגדרות הללו ולטעון אותם לפעם אחרת', 'ייצוא', 100, '1.0.2', 'https://drive.google.com/uc?export=download&id=1LIMtXLelBW4SswKUkAxnj1ByA1y1h-BN', NULL, NULL, 13),
('export-all-open', 'ייצוא מכל המסמכים הפתוחים.jsx', 'ייצוא מכל המסמכים הפתוחים', 'מאפשר לייצא לPDF מכל המסמכים הפעילים', 'ייצוא', 100, '1.0.1', 'https://drive.google.com/uc?export=download&id=1A_idlqX6mpV4hb4V-opF-k9zAiXt3hjn', NULL, NULL, 14),
('unlock-objects', 'משחרר את כל האובייקטים הנעולים במסמך.jsx', 'משחרר אובייקטים נעולים במסמך', 'משחרר את כל האובייקטים הנעולים במסמך', 'עימוד', NULL, '1.0.1', 'https://drive.google.com/uc?export=download&id=1MbzrHAxLEWRx2wrjBFDBnkjv7HOVHOI0', NULL, NULL, 15),
('export-pairs', 'ייצוא צמדים במסמך.jsx', 'ייצוא צמדים במסמך', 'מאפשר לייצא לPDF כל צמד בודד למסמך אחר', 'ייצוא', 100, '1.0.1', 'https://drive.google.com/uc?export=download&id=1MyEZLFqco1S-g1hvl7goAy2TFsr-hIpp', NULL, NULL, 16),
('object-style-by-paragraph', 'מחיל סגנון אובייקט לפי סגנון פסקה.jsx', 'מחיל סגנון אובייקט לפי סגנון פסקה', 'מאפשר להחיל סגנון אובייקט על המסגרת שקיים בה הסגנון פסקה המסויים', 'עימוד', 50, '1.0.1', 'https://drive.google.com/uc?export=download&id=1y0jw3Ibh98Srz8vHdqetNhyDxZtjPP_n', NULL, NULL, 17),
('page-navigator', 'ניווט עמודים.jsx', 'ניווט עמודים', 'מאפשר לנווט בקלות ובגמישות בין עמודים', 'ניווט', 50, '1.0.1', 'https://drive.google.com/uc?export=download&id=15HlHEIv8qzZhOISXMkhBYugtmAQaAZTg', NULL, 'https://youtu.be/9BYDRXv4ap8', 18),
('sort-export-by-object-style', 'ממיין ומייצא עמודים לפי סגנון אובייקט.jsx', 'ממיין ומייצא עמודים לפי סגנון אובייקט', 'מאפשר למיין עמודים לפי שם של סגנון אובייקט ולייצא לPDF כל מסמך לפי האובייקט סגנון שלו', 'ייצוא', NULL, '1.0.1', 'https://drive.google.com/uc?export=download&id=1D7u42rpEM-T-f0NZ_bgNHaJIohq8XJRA', NULL, NULL, 19),
('shape-from-paragraph', 'צורה מסגנון פסקהHeb.jsx', 'צורה מסגנון פסקה', 'משפל את כל הטקסט שבסגנון באותו מיקום בשכבה אחרת ומחיל עליו סגנון אובייקט', 'עיצוב', 250, '1.0.1', 'https://drive.google.com/uc?export=download&id=1EVcXuGFGcHBK94rBnBQN2uJk10JOPjv8', NULL, 'https://youtu.be/gtr6azVuW2E', 20),
('find-replace-batch', 'חיפושים והחלפות.jsx', 'חיפושים והחלפות', 'מאפשר ליצור רשימת חיפושים והחלפות עם כל הנתונים כולל סגנונות ועיצוב, מאפשר לשמור קובץ לשימוש חוזר, ולהריץ הכל בלחיצה אחת — על מסמך, בחירה, סטורי, כל המסמכים או תיקייה שלמה', 'עימוד', 350, '1.0.4', 'https://drive.google.com/uc?export=download&id=1e5IimUkfqBMObRlDuE96VGZf5LYEJUhH', NULL, 'https://youtu.be/Ofu7WgNhpUc', 21),
('source-end-paragraph', 'מקור בסוף פסקה.jsx', 'מקור בסוף פסקה', 'מאפשר להכניס מוביל טאב לפני מקור בסוף פסקה', 'עימוד', 50, '1.0.1', 'https://drive.google.com/uc?export=download&id=1CDJwIe-P95ZnGKln2sc3ZdrgwszZc6Ef', NULL, NULL, 22),
('live-toc', 'תוכן עניינים חי.jsx', 'תוכן עניינים חי', 'מאפשר לעדכן תוכן עניינים ולהפוך את המספור למספור דינמי', 'עימוד', 250, '1.0.1', 'https://drive.google.com/uc?export=download&id=1PEbZfgUTV0NjeH5a0gAbOrTT7nLsc0Ds', NULL, 'https://youtu.be/OXjSsUzrMW4', 23),
('automation', 'אוטומציה.jsx', 'אוטומציה', 'מאפשר לשמור תהליכים ולהריצם בפעם אחת תומך בסקריפטים מחליף טקסט, המקצר, חיפושים והחלפות, ייצוא מרובה פריסטים', 'עימוד', 300, '1.0.1', 'https://drive.google.com/uc?export=download&id=1d3Uwa8eA0OkNCn65Nf5g3kbUF3Vk5u_A', NULL, 'https://youtu.be/rc53d_rdO1w', 24),
('text-copier', 'מעתיק טקסט.jsx', 'מעתיק טקסט', 'מאפשר להעתיק טקסט בסגנון תו מסויים למסגרת טקסט עם תגית מסויימת', 'עימוד', 50, '1.0.1', 'https://drive.google.com/uc?export=download&id=1etpd5vvLNIyOhr6oS-XO7H_Mp0O8rjnE', NULL, NULL, 25),
('multi-text', 'רב טקסט 2.0.jsx', 'רב טקסט', 'מאפשר לעמד ספר מרובה טקסטים בגמישות מירבית ומיטבית בתוספת ברך/מספור ועוד', 'עימוד', 750, '2.0.1', 'https://drive.google.com/uc?export=download&id=1WGke_qpM0chJLxn737JIIOLsXf2guLwv', NULL, 'https://www.youtube.com/playlist?list=PLj08Su4Nu9lP1DshKJChhDLWFVFB9c4eP', 26),
('paragraph-sorter', 'ממיין פסקאות.jsx', 'ממיין פסקאות', 'מאפשר למיין סדר פסקאות במסמך/בחירה/סטורי כלומר אם סדר הפסקאות במסמך הוא סגנון 1 סגנון 2 סגנון 3 ואני רוצה להחליף את הסדר שלהם במסמך שיהיה סגנון 3 סגנון 1 סגנון 2 בדיוק בשביל זה נוצר הסקריפט', 'עימוד', 200, '1.0.1', 'https://drive.google.com/uc?export=download&id=1W9DZt9gPmPtTjT93JHJnWk0zrUg16_O8', NULL, NULL, 27);
