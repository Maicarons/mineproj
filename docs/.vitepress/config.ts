import { defineConfig } from 'vitepress'

const base = process.env.DOCS_BASE ?? '/mineproj/'

export default defineConfig({
  base,
  title: 'mineproj',
  description: 'Apache-2.0 licensed static site generator for personal project portfolios',
  lastUpdated: true,
  cleanUrls: true,
  appearance: 'toggle',
  markdown: {
    lineNumbers: true,
  },
  locales: {
    root: {
      label: 'English',
      lang: 'en',
      dir: 'ltr',
      title: 'mineproj',
      description: 'Apache-2.0 licensed static site generator for personal project portfolios',
      themeConfig: {
        nav: [
          { text: 'Guide', link: '/guide/getting-started' },
          { text: 'Theme Dev', link: '/guide/theme-development' },
          { text: 'Plugin Dev', link: '/guide/plugin-development' },
          { text: 'API', link: '/guide/api-reference' },
          { text: 'Deploy', link: '/guide/deploying' },
        ],
        sidebar: {
          '/': [
            {
              text: 'Getting Started',
              items: [
                { text: 'Quick Start', link: '/guide/getting-started' },
                { text: 'Configuration', link: '/guide/configuration' },
                { text: 'Data Model', link: '/guide/data-model' },
                { text: 'Deploying', link: '/guide/deploying' },
              ],
            },
            {
              text: 'Theme Development',
              items: [
                { text: 'Theme Basics', link: '/guide/theme-development' },
                { text: 'Layouts & Slots', link: '/guide/theme-layouts' },
                { text: 'Islands', link: '/guide/theme-islands' },
              ],
            },
            {
              text: 'Plugin Development',
              items: [
                { text: 'Plugin Basics', link: '/guide/plugin-development' },
                { text: 'Lifecycle Hooks', link: '/guide/plugin-hooks' },
              ],
            },
            {
              text: 'Reference',
              items: [
                { text: 'API Reference', link: '/guide/api-reference' },
                { text: 'CLI Reference', link: '/guide/cli-reference' },
                { text: 'Configuration Reference', link: '/guide/configuration' },
              ],
            },
          ],
        },
        docFooter: { prev: 'Previous', next: 'Next' },
        outline: { label: 'On this page' },
        lastUpdated: { text: 'Last updated' },
        returnToTopLabel: 'Back to top',
        sidebarMenuLabel: 'Menu',
        darkModeSwitchLabel: 'Appearance',
        lightModeSwitchTitle: 'Switch to light mode',
        darkModeSwitchTitle: 'Switch to dark mode',
      },
    },
    'zh-CN': {
      label: '简体中文',
      lang: 'zh-CN',
      dir: 'ltr',
      title: 'mineproj',
      description: 'Apache-2.0 许可的静态站点生成器，用于个人项目展示',
      themeConfig: {
        nav: [
          { text: '指南', link: '/zh-CN/guide/getting-started' },
          { text: '主题开发', link: '/zh-CN/guide/theme-development' },
          { text: '插件开发', link: '/zh-CN/guide/plugin-development' },
          { text: 'API', link: '/zh-CN/guide/api-reference' },
          { text: '部署', link: '/zh-CN/guide/deploying' },
        ],
        sidebar: {
          '/zh-CN/': [
            {
              text: '入门指南',
              items: [
                { text: '快速开始', link: '/zh-CN/guide/getting-started' },
                { text: '配置', link: '/zh-CN/guide/configuration' },
                { text: '数据模型', link: '/zh-CN/guide/data-model' },
                { text: '部署', link: '/zh-CN/guide/deploying' },
              ],
            },
            {
              text: '主题开发',
              items: [
                { text: '主题基础', link: '/zh-CN/guide/theme-development' },
                { text: '布局与插槽', link: '/zh-CN/guide/theme-layouts' },
                { text: 'Islands', link: '/zh-CN/guide/theme-islands' },
              ],
            },
            {
              text: '插件开发',
              items: [
                { text: '插件基础', link: '/zh-CN/guide/plugin-development' },
                { text: '生命周期钩子', link: '/zh-CN/guide/plugin-hooks' },
              ],
            },
            {
              text: '参考',
              items: [
                { text: 'API 参考', link: '/zh-CN/guide/api-reference' },
                { text: 'CLI 参考', link: '/zh-CN/guide/cli-reference' },
                { text: '配置参考', link: '/zh-CN/guide/configuration' },
              ],
            },
          ],
        },
        docFooter: { prev: '上一页', next: '下一页' },
        outline: { label: '本页目录' },
        lastUpdated: { text: '最后更新于' },
        returnToTopLabel: '回到顶部',
        sidebarMenuLabel: '菜单',
        darkModeSwitchLabel: '主题',
        lightModeSwitchTitle: '切换到浅色模式',
        darkModeSwitchTitle: '切换到深色模式',
      },
    },
    hi: {
      label: 'हिन्दी',
      lang: 'hi',
      dir: 'ltr',
      title: 'mineproj',
      description: 'Apache-2.0 लाइसेंस प्राप्त स्थैतिक साइट जनरेटर',
      themeConfig: {
        nav: [
          { text: 'गाइड', link: '/hi/guide/getting-started' },
          { text: 'थीम', link: '/hi/guide/theme-development' },
          { text: 'प्लगइन', link: '/hi/guide/plugin-development' },
          { text: 'API', link: '/hi/guide/api-reference' },
          { text: 'डिप्लॉय', link: '/hi/guide/deploying' },
        ],
        sidebar: {
          '/hi/': [
            {
              text: 'आरंभ करना',
              items: [
                { text: 'त्वरित आरंभ', link: '/hi/guide/getting-started' },
                { text: 'कॉन्फ़िगरेशन', link: '/hi/guide/configuration' },
                { text: 'डेटा मॉडल', link: '/hi/guide/data-model' },
                { text: 'डिप्लॉय करना', link: '/hi/guide/deploying' },
              ],
            },
            {
              text: 'थीम विकास',
              items: [
                { text: 'थीम मूल बातें', link: '/hi/guide/theme-development' },
                { text: 'लेआउट और स्लॉट', link: '/hi/guide/theme-layouts' },
                { text: 'आइलैंड्स', link: '/hi/guide/theme-islands' },
              ],
            },
            {
              text: 'प्लगइन विकास',
              items: [
                { text: 'प्लगइन मूल बातें', link: '/hi/guide/plugin-development' },
                { text: 'लाइफसाइकिल हुक', link: '/hi/guide/plugin-hooks' },
              ],
            },
            {
              text: 'संदर्भ',
              items: [
                { text: 'API संदर्भ', link: '/hi/guide/api-reference' },
                { text: 'CLI संदर्भ', link: '/hi/guide/cli-reference' },
                { text: 'कॉन्फ़िगरेशन संदर्भ', link: '/hi/guide/configuration' },
              ],
            },
          ],
        },
        docFooter: { prev: 'पिछला', next: 'अगला' },
        outline: { label: 'इस पेज पर' },
        lastUpdated: { text: 'अंतिम अपडेट' },
        returnToTopLabel: 'वापस ऊपर',
        sidebarMenuLabel: 'मेनू',
        darkModeSwitchLabel: 'दिखावट',
        lightModeSwitchTitle: 'हल्का मोड',
        darkModeSwitchTitle: 'गहरा मोड',
      },
    },
    es: {
      label: 'Español',
      lang: 'es',
      dir: 'ltr',
      title: 'mineproj',
      description: 'Generador de sitios estáticos con licencia Apache-2.0',
      themeConfig: {
        nav: [
          { text: 'Guía', link: '/es/guide/getting-started' },
          { text: 'Temas', link: '/es/guide/theme-development' },
          { text: 'Plugins', link: '/es/guide/plugin-development' },
          { text: 'API', link: '/es/guide/api-reference' },
          { text: 'Despliegue', link: '/es/guide/deploying' },
        ],
        sidebar: {
          '/es/': [
            {
              text: 'Primeros Pasos',
              items: [
                { text: 'Inicio Rápido', link: '/es/guide/getting-started' },
                { text: 'Configuración', link: '/es/guide/configuration' },
                { text: 'Modelo de Datos', link: '/es/guide/data-model' },
                { text: 'Despliegue', link: '/es/guide/deploying' },
              ],
            },
            {
              text: 'Desarrollo de Temas',
              items: [
                { text: 'Conceptos Básicos', link: '/es/guide/theme-development' },
                { text: 'Diseños y Slots', link: '/es/guide/theme-layouts' },
                { text: 'Islas', link: '/es/guide/theme-islands' },
              ],
            },
            {
              text: 'Desarrollo de Plugins',
              items: [
                { text: 'Conceptos Básicos', link: '/es/guide/plugin-development' },
                { text: 'Hooks de Ciclo de Vida', link: '/es/guide/plugin-hooks' },
              ],
            },
            {
              text: 'Referencia',
              items: [
                { text: 'Referencia de API', link: '/es/guide/api-reference' },
                { text: 'Referencia de CLI', link: '/es/guide/cli-reference' },
                { text: 'Referencia de Configuración', link: '/es/guide/configuration' },
              ],
            },
          ],
        },
        docFooter: { prev: 'Anterior', next: 'Siguiente' },
        outline: { label: 'En esta página' },
        lastUpdated: { text: 'Última actualización' },
        returnToTopLabel: 'Volver arriba',
        sidebarMenuLabel: 'Menú',
        darkModeSwitchLabel: 'Apariencia',
        lightModeSwitchTitle: 'Modo claro',
        darkModeSwitchTitle: 'Modo oscuro',
      },
    },
    ar: {
      label: 'العربية',
      lang: 'ar',
      dir: 'rtl',
      title: 'mineproj',
      description: 'مولد مواقع ثابتة مرخص بموجب Apache-2.0',
      themeConfig: {
        nav: [
          { text: 'دليل', link: '/ar/guide/getting-started' },
          { text: 'تطوير السمات', link: '/ar/guide/theme-development' },
          { text: 'تطوير الإضافات', link: '/ar/guide/plugin-development' },
          { text: 'API', link: '/ar/guide/api-reference' },
          { text: 'نشر', link: '/ar/guide/deploying' },
        ],
        sidebar: {
          '/ar/': [
            {
              text: 'ابدأ هنا',
              items: [
                { text: 'بداية سريعة', link: '/ar/guide/getting-started' },
                { text: 'الإعدادات', link: '/ar/guide/configuration' },
                { text: 'نموذج البيانات', link: '/ar/guide/data-model' },
                { text: 'النشر', link: '/ar/guide/deploying' },
              ],
            },
            {
              text: 'تطوير السمة',
              items: [
                { text: 'أساسيات السمة', link: '/ar/guide/theme-development' },
                { text: 'التخطيطات والفتحات', link: '/ar/guide/theme-layouts' },
                { text: 'الجزر', link: '/ar/guide/theme-islands' },
              ],
            },
            {
              text: 'تطوير الإضافة',
              items: [
                { text: 'أساسيات الإضافة', link: '/ar/guide/plugin-development' },
                { text: 'خطافات دورة الحياة', link: '/ar/guide/plugin-hooks' },
              ],
            },
            {
              text: 'المراجع',
              items: [
                { text: 'مرجع API', link: '/ar/guide/api-reference' },
                { text: 'مرجع CLI', link: '/ar/guide/cli-reference' },
                { text: 'مرجع الإعدادات', link: '/ar/guide/configuration' },
              ],
            },
          ],
        },
        docFooter: { prev: 'السابق', next: 'التالي' },
        outline: { label: 'في هذه الصفحة' },
        lastUpdated: { text: 'آخر تحديث' },
        returnToTopLabel: 'العودة إلى الأعلى',
        sidebarMenuLabel: 'القائمة',
        darkModeSwitchLabel: 'المظهر',
        lightModeSwitchTitle: 'الوضع الفاتح',
        darkModeSwitchTitle: 'الوضع الداكن',
      },
    },
    fr: {
      label: 'Français',
      lang: 'fr',
      dir: 'ltr',
      title: 'mineproj',
      description: 'Générateur de sites statiques sous licence Apache-2.0',
      themeConfig: {
        nav: [
          { text: 'Guide', link: '/fr/guide/getting-started' },
          { text: 'Thèmes', link: '/fr/guide/theme-development' },
          { text: 'Plugins', link: '/fr/guide/plugin-development' },
          { text: 'API', link: '/fr/guide/api-reference' },
          { text: 'Déploiement', link: '/fr/guide/deploying' },
        ],
        sidebar: {
          '/fr/': [
            {
              text: 'Pour Commencer',
              items: [
                { text: 'Démarrage Rapide', link: '/fr/guide/getting-started' },
                { text: 'Configuration', link: '/fr/guide/configuration' },
                { text: 'Modèle de Données', link: '/fr/guide/data-model' },
                { text: 'Déploiement', link: '/fr/guide/deploying' },
              ],
            },
            {
              text: 'Développement de Thème',
              items: [
                { text: 'Bases du Thème', link: '/fr/guide/theme-development' },
                { text: 'Mises en Page et Emplacements', link: '/fr/guide/theme-layouts' },
                { text: 'Îles', link: '/fr/guide/theme-islands' },
              ],
            },
            {
              text: 'Développement de Plugin',
              items: [
                { text: 'Bases du Plugin', link: '/fr/guide/plugin-development' },
                { text: 'Hooks de Cycle de Vie', link: '/fr/guide/plugin-hooks' },
              ],
            },
            {
              text: 'Référence',
              items: [
                { text: 'Référence API', link: '/fr/guide/api-reference' },
                { text: 'Référence CLI', link: '/fr/guide/cli-reference' },
                { text: 'Référence de Configuration', link: '/fr/guide/configuration' },
              ],
            },
          ],
        },
        docFooter: { prev: 'Précédent', next: 'Suivant' },
        outline: { label: 'Sur cette page' },
        lastUpdated: { text: 'Dernière mise à jour' },
        returnToTopLabel: 'Retour en haut',
        sidebarMenuLabel: 'Menu',
        darkModeSwitchLabel: 'Apparence',
        lightModeSwitchTitle: 'Mode clair',
        darkModeSwitchTitle: 'Mode sombre',
      },
    },
    bn: {
      label: 'বাংলা',
      lang: 'bn',
      dir: 'ltr',
      title: 'mineproj',
      description: 'Apache-2.0 লাইসেন্সকৃত স্ট্যাটিক সাইট জেনারেটর',
      themeConfig: {
        nav: [
          { text: 'গাইড', link: '/bn/guide/getting-started' },
          { text: 'থিম', link: '/bn/guide/theme-development' },
          { text: 'প্লাগইন', link: '/bn/guide/plugin-development' },
          { text: 'API', link: '/bn/guide/api-reference' },
          { text: 'ডিপ্লয়', link: '/bn/guide/deploying' },
        ],
        sidebar: {
          '/bn/': [
            {
              text: 'শুরু করা',
              items: [
                { text: 'দ্রুত শুরু', link: '/bn/guide/getting-started' },
                { text: 'কনফিগারেশন', link: '/bn/guide/configuration' },
                { text: 'ডেটা মডেল', link: '/bn/guide/data-model' },
                { text: 'ডিপ্লয়', link: '/bn/guide/deploying' },
              ],
            },
            {
              text: 'থিম ডেভেলপমেন্ট',
              items: [
                { text: 'থিম বেসিক', link: '/bn/guide/theme-development' },
                { text: 'লেআউট ও স্লট', link: '/bn/guide/theme-layouts' },
                { text: 'আইল্যান্ডস', link: '/bn/guide/theme-islands' },
              ],
            },
            {
              text: 'প্লাগিন ডেভেলপমেন্ট',
              items: [
                { text: 'প্লাগিন বেসিক', link: '/bn/guide/plugin-development' },
                { text: 'লাইফসাইকেল হুক', link: '/bn/guide/plugin-hooks' },
              ],
            },
            {
              text: 'রেফারেন্স',
              items: [
                { text: 'API রেফারেন্স', link: '/bn/guide/api-reference' },
                { text: 'CLI রেফারেন্স', link: '/bn/guide/cli-reference' },
                { text: 'কনফিগারেশন রেফারেন্স', link: '/bn/guide/configuration' },
              ],
            },
          ],
        },
        docFooter: { prev: 'পূর্ববর্তী', next: 'পরবর্তী' },
        outline: { label: 'এই পৃষ্ঠায়' },
        lastUpdated: { text: 'সর্বশেষ আপডেট' },
        returnToTopLabel: 'উপরে ফিরে যান',
        sidebarMenuLabel: 'মেনু',
        darkModeSwitchLabel: 'চেহারা',
        lightModeSwitchTitle: 'হালকা মোড',
        darkModeSwitchTitle: 'গাঢ় মোড',
      },
    },
    pt: {
      label: 'Português',
      lang: 'pt',
      dir: 'ltr',
      title: 'mineproj',
      description: 'Gerador de sites estáticos licenciado sob Apache-2.0',
      themeConfig: {
        nav: [
          { text: 'Guia', link: '/pt/guide/getting-started' },
          { text: 'Temas', link: '/pt/guide/theme-development' },
          { text: 'Plugins', link: '/pt/guide/plugin-development' },
          { text: 'API', link: '/pt/guide/api-reference' },
          { text: 'Implantar', link: '/pt/guide/deploying' },
        ],
        sidebar: {
          '/pt/': [
            {
              text: 'Primeiros Passos',
              items: [
                { text: 'Início Rápido', link: '/pt/guide/getting-started' },
                { text: 'Configuração', link: '/pt/guide/configuration' },
                { text: 'Modelo de Dados', link: '/pt/guide/data-model' },
                { text: 'Implantação', link: '/pt/guide/deploying' },
              ],
            },
            {
              text: 'Desenvolvimento de Temas',
              items: [
                { text: 'Fundamentos de Temas', link: '/pt/guide/theme-development' },
                { text: 'Layouts e Slots', link: '/pt/guide/theme-layouts' },
                { text: 'Ilhas', link: '/pt/guide/theme-islands' },
              ],
            },
            {
              text: 'Desenvolvimento de Plugins',
              items: [
                { text: 'Fundamentos de Plugins', link: '/pt/guide/plugin-development' },
                { text: 'Hooks de Ciclo de Vida', link: '/pt/guide/plugin-hooks' },
              ],
            },
            {
              text: 'Referência',
              items: [
                { text: 'Referência da API', link: '/pt/guide/api-reference' },
                { text: 'Referência da CLI', link: '/pt/guide/cli-reference' },
                { text: 'Referência de Configuração', link: '/pt/guide/configuration' },
              ],
            },
          ],
        },
        docFooter: { prev: 'Anterior', next: 'Próximo' },
        outline: { label: 'Nesta página' },
        lastUpdated: { text: 'Última atualização' },
        returnToTopLabel: 'Voltar ao topo',
        sidebarMenuLabel: 'Menu',
        darkModeSwitchLabel: 'Aparência',
        lightModeSwitchTitle: 'Modo claro',
        darkModeSwitchTitle: 'Modo escuro',
      },
    },
    ru: {
      label: 'Русский',
      lang: 'ru',
      dir: 'ltr',
      title: 'mineproj',
      description: 'Генератор статических сайтов с лицензией Apache-2.0',
      themeConfig: {
        nav: [
          { text: 'Руководство', link: '/ru/guide/getting-started' },
          { text: 'Темы', link: '/ru/guide/theme-development' },
          { text: 'Плагины', link: '/ru/guide/plugin-development' },
          { text: 'API', link: '/ru/guide/api-reference' },
          { text: 'Развертывание', link: '/ru/guide/deploying' },
        ],
        sidebar: {
          '/ru/': [
            {
              text: 'Начало работы',
              items: [
                { text: 'Быстрый старт', link: '/ru/guide/getting-started' },
                { text: 'Конфигурация', link: '/ru/guide/configuration' },
                { text: 'Модель данных', link: '/ru/guide/data-model' },
                { text: 'Развертывание', link: '/ru/guide/deploying' },
              ],
            },
            {
              text: 'Разработка тем',
              items: [
                { text: 'Основы тем', link: '/ru/guide/theme-development' },
                { text: 'Макеты и слоты', link: '/ru/guide/theme-layouts' },
                { text: 'Острова', link: '/ru/guide/theme-islands' },
              ],
            },
            {
              text: 'Разработка плагинов',
              items: [
                { text: 'Основы плагинов', link: '/ru/guide/plugin-development' },
                { text: 'Хуки жизненного цикла', link: '/ru/guide/plugin-hooks' },
              ],
            },
            {
              text: 'Справочник',
              items: [
                { text: 'Справочник API', link: '/ru/guide/api-reference' },
                { text: 'Справочник CLI', link: '/ru/guide/cli-reference' },
                { text: 'Справочник конфигурации', link: '/ru/guide/configuration' },
              ],
            },
          ],
        },
        docFooter: { prev: 'Назад', next: 'Вперед' },
        outline: { label: 'На этой странице' },
        lastUpdated: { text: 'Последнее обновление' },
        returnToTopLabel: 'Наверх',
        sidebarMenuLabel: 'Меню',
        darkModeSwitchLabel: 'Вид',
        lightModeSwitchTitle: 'Светлый режим',
        darkModeSwitchTitle: 'Темный режим',
      },
    },
    id: {
      label: 'Bahasa Indonesia',
      lang: 'id',
      dir: 'ltr',
      title: 'mineproj',
      description: 'Pembangun situs statis berlisensi Apache-2.0',
      themeConfig: {
        nav: [
          { text: 'Panduan', link: '/id/guide/getting-started' },
          { text: 'Tema', link: '/id/guide/theme-development' },
          { text: 'Plugin', link: '/id/guide/plugin-development' },
          { text: 'API', link: '/id/guide/api-reference' },
          { text: 'Deploy', link: '/id/guide/deploying' },
        ],
        sidebar: {
          '/id/': [
            {
              text: 'Memulai',
              items: [
                { text: 'Mulai Cepat', link: '/id/guide/getting-started' },
                { text: 'Konfigurasi', link: '/id/guide/configuration' },
                { text: 'Model Data', link: '/id/guide/data-model' },
                { text: 'Menyebarkan', link: '/id/guide/deploying' },
              ],
            },
            {
              text: 'Pengembangan Tema',
              items: [
                { text: 'Dasar Tema', link: '/id/guide/theme-development' },
                { text: 'Tata Letak & Slot', link: '/id/guide/theme-layouts' },
                { text: 'Islands', link: '/id/guide/theme-islands' },
              ],
            },
            {
              text: 'Pengembangan Plugin',
              items: [
                { text: 'Dasar Plugin', link: '/id/guide/plugin-development' },
                { text: 'Hook Siklus Hidup', link: '/id/guide/plugin-hooks' },
              ],
            },
            {
              text: 'Referensi',
              items: [
                { text: 'Referensi API', link: '/id/guide/api-reference' },
                { text: 'Referensi CLI', link: '/id/guide/cli-reference' },
                { text: 'Referensi Konfigurasi', link: '/id/guide/configuration' },
              ],
            },
          ],
        },
        docFooter: { prev: 'Sebelumnya', next: 'Selanjutnya' },
        outline: { label: 'Di halaman ini' },
        lastUpdated: { text: 'Terakhir diperbarui' },
        returnToTopLabel: 'Kembali ke atas',
        sidebarMenuLabel: 'Menu',
        darkModeSwitchLabel: 'Tampilan',
        lightModeSwitchTitle: 'Mode terang',
        darkModeSwitchTitle: 'Mode gelap',
      },
    },
    ko: {
      label: '한국어',
      lang: 'ko',
      dir: 'ltr',
      title: 'mineproj',
      description: 'Apache-2.0 라이선스 정적 사이트 생성기',
      themeConfig: {
        nav: [
          { text: '가이드', link: '/ko/guide/getting-started' },
          { text: '테마 개발', link: '/ko/guide/theme-development' },
          { text: '플러그인 개발', link: '/ko/guide/plugin-development' },
          { text: 'API', link: '/ko/guide/api-reference' },
          { text: '배포', link: '/ko/guide/deploying' },
        ],
        sidebar: {
          '/ko/': [
            {
              text: '시작하기',
              items: [
                { text: '빠른 시작', link: '/ko/guide/getting-started' },
                { text: '설정', link: '/ko/guide/configuration' },
                { text: '데이터 모델', link: '/ko/guide/data-model' },
                { text: '배포', link: '/ko/guide/deploying' },
              ],
            },
            {
              text: '테마 개발',
              items: [
                { text: '테마 기초', link: '/ko/guide/theme-development' },
                { text: '레이아웃 및 슬롯', link: '/ko/guide/theme-layouts' },
                { text: '아일랜드', link: '/ko/guide/theme-islands' },
              ],
            },
            {
              text: '플러그인 개발',
              items: [
                { text: '플러그인 기초', link: '/ko/guide/plugin-development' },
                { text: '라이프사이클 훅', link: '/ko/guide/plugin-hooks' },
              ],
            },
            {
              text: '참조',
              items: [
                { text: 'API 참조', link: '/ko/guide/api-reference' },
                { text: 'CLI 참조', link: '/ko/guide/cli-reference' },
                { text: '설정 참조', link: '/ko/guide/configuration' },
              ],
            },
          ],
        },
        docFooter: { prev: '이전', next: '다음' },
        outline: { label: '페이지 내용' },
        lastUpdated: { text: '마지막 업데이트' },
        returnToTopLabel: '맨 위로',
        sidebarMenuLabel: '메뉴',
        darkModeSwitchLabel: '테마',
        lightModeSwitchTitle: '라이트 모드',
        darkModeSwitchTitle: '다크 모드',
      },
    },
  },
  themeConfig: {
    socialLinks: [
      { icon: 'github', link: 'https://github.com/Maicarons/mineproj' },
    ],
    search: {
      provider: 'local',
    },
    footer: {
      message: 'Released under the Apache-2.0 License.',
      copyright: 'Copyright © 2026 mineproj contributors',
    },
    editLink: {
      pattern: 'https://github.com/Maicarons/mineproj/edit/main/docs/:path',
      text: 'Edit this page on GitHub',
    },
  },
})