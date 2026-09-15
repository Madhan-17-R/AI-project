import os, re

LOCALES_DIR = 'src/lib/i18n/locales'

LANDING = {
  'hindi': {
    'titlePart1': 'अपने खेत को जानें।',
    'titlePart2': 'आत्मविश्वास के साथ बढ़ें।',
    'subtitle': 'Marudam आपके खेत की सामान्य स्थिति सीखता है।',
    'explorePlatform': 'प्लेटफॉर्म देखें',
    'builtForIndianFarmers': 'भारतीय किसानों के लिए',
    'realTimeAI': 'रीयल-टाइम एआई जानकारी',
    'smartIrrigation': 'स्मार्ट सिंचाई',
  },
  'assamese': {
    'titlePart1': 'আপোনাৰ পথাৰ জানক।',
    'titlePart2': 'আত্মবিশ্বাসেৰে খেতি কৰক।',
    'subtitle': 'Marudam আপোনাৰ পথাৰৰ স্বাভাৱিক অৱস্থা শিকে।',
    'explorePlatform': 'প্লেটফৰ্ম অন্বেষণ কৰক',
    'builtForIndianFarmers': 'ভাৰতীয় কৃষকসকলৰ বাবে',
    'realTimeAI': 'ৰিয়েল-টাইম এআই তথ্য',
    'smartIrrigation': 'স্মাৰ্ট জলসিঞ্চন',
  },
  'dogri': {
    'titlePart1': 'आपणे खेत गी जानो।',
    'titlePart2': 'आत्मविश्वास कन्नै उगाओ।',
    'subtitle': 'Marudam आपणे खेत दी साधारण स्थिति सिखदा ऐ।',
    'explorePlatform': 'प्लेटफॉर्म देखो',
    'builtForIndianFarmers': 'भारतीय किसानें दे वास्ते',
    'realTimeAI': 'रियल-टाइम एआई जानकारी',
    'smartIrrigation': 'स्मार्ट सिंचाई',
  },
  'gujarati': {
    'titlePart1': 'તમારા ખેતરને ઓળખો.',
    'titlePart2': 'વિશ્વાસ સાથે ઉગાડો.',
    'subtitle': 'Marudam તમારા ખેતર માટે સ્વાભાવિક સ્થિતિ શીખે છે.',
    'explorePlatform': 'પ્લેટફ઼ૉર્મ જુઓ',
    'builtForIndianFarmers': 'ભારતીય ખેડૂતો માટે',
    'realTimeAI': 'રીઅલ-ટાઇમ AI માહિતી',
    'smartIrrigation': 'સ્માર્ટ સિંચાઈ',
  },
  'maithili': {
    'titlePart1': 'अपन खेत जानू।',
    'titlePart2': 'विश्वास संग उगाउ।',
    'subtitle': 'Marudam अपन खेतक सामान्य स्थिति सीखैत अछि।',
    'explorePlatform': 'प्लेटफ़ॉर्म देखू',
    'builtForIndianFarmers': 'भारतीय किसानक लेल',
    'realTimeAI': 'रियल-टाइम एआई जानकारी',
    'smartIrrigation': 'स्मार्ट सिंचाई',
  },
  'malayalam': {
    'titlePart1': 'നിങ്ങളുടെ വയൽ അറിയൂ.',
    'titlePart2': 'ആത്മവിശ്വാസത്തോടെ കൃഷി ചെയ്യൂ.',
    'subtitle': 'Marudam നിങ്ങളുടെ വയലിൻ്റെ സ്വാഭാവിക അവസ്ഥ പഠിക്കുന്നു.',
    'explorePlatform': 'പ്ലാറ്റ്ഫോം കാണൂ',
    'builtForIndianFarmers': 'ഇന്ത്യൻ കർഷകർക്കായി',
    'realTimeAI': 'തത്സമയ AI ഉൾക്കാഴ്ചകൾ',
    'smartIrrigation': 'സ്മാർട്ട് ജലസേചനം',
  },
  'manipuri': {
    'titlePart1': 'লৈ নুংশিবা তোকপা।',
    'titlePart2': 'নম্বীদুনা থবক থাজবা।',
    'subtitle': 'Marudam লৈগী থৌওং ওইবা থবক শিনবীরে।',
    'explorePlatform': 'প্লেটফর্ম হায়বিরক',
    'builtForIndianFarmers': 'ভারতকী মিয়াম থৌদাংবসিনা',
    'realTimeAI': 'রিয়েল-টাইম এআই থৌনা',
    'smartIrrigation': 'স্মার্ট পানী পোকপা',
  },
  'odia': {
    'titlePart1': 'ଆପଣଙ୍କ ଜମି ଜାଣନ୍ତୁ।',
    'titlePart2': 'ଆତ୍ମ ବିଶ୍ୱାସ ସହ ଚାଷ କରନ୍ତୁ।',
    'subtitle': 'Marudam ଆପଣଙ୍କ ଜମି ପାଇଁ ସ୍ୱାଭାବିକ ସ୍ଥିତି ଶିଖେ।',
    'explorePlatform': 'ପ୍ଲାଟଫର୍ମ ଦେଖନ୍ତୁ',
    'builtForIndianFarmers': 'ଭାରତୀୟ ଚାଷୀଙ୍କ ପାଇଁ',
    'realTimeAI': 'ରିଅଲ-ଟାଇମ AI ଅନ୍ତଦୃଷ୍ଟି',
    'smartIrrigation': 'ସ୍ମାର୍ଟ ଜଳ ସେଚ',
  },
  'sanskrit': {
    'titlePart1': 'स्वक्षेत्रं जानीत।',
    'titlePart2': 'विश्वासेन कृषिं कुरुत।',
    'subtitle': 'Marudam भवतः क्षेत्रस्य सामान्यस्थितिं शिक्षते।',
    'explorePlatform': 'मञ्च दृश्यताम्',
    'builtForIndianFarmers': 'भारतीयकृषकेभ्यः',
    'realTimeAI': 'तत्क्षण AI ज्ञानम्',
    'smartIrrigation': 'स्मार्ट सिञ्चनम्',
  },
  'tamil': {
    'titlePart1': 'உங்கள் வயலை அறிந்திடுங்கள்.',
    'titlePart2': 'நம்பிக்கையுடன் விவசாயம் செய்யுங்கள்.',
    'subtitle': 'Marudam உங்கள் வயலுக்கு இயல்பான நிலைமைகளை கற்றுக்கொள்கிறது.',
    'explorePlatform': 'தளத்தை ஆராயுங்கள்',
    'builtForIndianFarmers': 'இந்திய விவசாயிகளுக்காக',
    'realTimeAI': 'நேரடி AI தகவல்கள்',
    'smartIrrigation': 'ஸ்மார்ட் நீர்ப்பாசனம்',
  },
  'urdu': {
    'titlePart1': 'اپنی زمین کو پہچانیں۔',
    'titlePart2': 'اعتماد کے ساتھ کاشتکاری کریں۔',
    'subtitle': 'Marudam آپ کی زمین کی معمول کی حالت سیکھتا ہے۔',
    'explorePlatform': 'پلیٹ فارم دیکھیں',
    'builtForIndianFarmers': 'ہندوستانی کسانوں کے لیے',
    'realTimeAI': 'ریئل ٹائم AI معلومات',
    'smartIrrigation': 'سمارٹ آبپاشی',
  },
}

def make_landing_block(var_name):
    en = {
        'titlePart1': 'Know Your Field.',
        'titlePart2': 'Grow with Confidence.',
        'subtitle': "Marudam learns what is normal for your field.",
        'explorePlatform': 'Explore Platform',
        'builtForIndianFarmers': 'Built for Indian farmers',
        'realTimeAI': 'Real-time AI insights',
        'smartIrrigation': 'Smart irrigation',
    }
    d = LANDING.get(var_name, en)
    lines = ['  landing: {']
    for k, v in d.items():
        v2 = v.replace("'", "\\'")
        lines.append(f"    {k}: '{v2}',")
    lines.append('  },')
    return '\n'.join(lines)

missing = ['hindi', 'assamese', 'dogri', 'gujarati', 'maithili', 'malayalam', 'manipuri', 'odia', 'sanskrit', 'tamil', 'urdu']

for var_name in missing:
    path = os.path.join(LOCALES_DIR, f'{var_name}.ts')
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    block = make_landing_block(var_name)
    
    nav_match = re.search(r'(\n  ["\']?nav["\']?\s*:\s*\{)', content)
    brand_match = re.search(r'(\n  ["\']?brand["\']?\s*:\s*\{)', content)
    
    if nav_match:
        pos = nav_match.start()
        content = content[:pos] + '\n' + block + content[pos:]
        print(f'Added landing before nav in {var_name}.ts')
    elif brand_match:
        pos = brand_match.start()
        content = content[:pos] + '\n' + block + content[pos:]
        print(f'Added landing before brand in {var_name}.ts')
    else:
        print(f'WARNING: No insertion point found for {var_name}.ts')
        continue
    
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

print('Done adding landing sections.')
