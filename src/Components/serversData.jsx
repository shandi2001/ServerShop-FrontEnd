const serversData = [
  {
    id: 1,
    type: 'vps',
    usage: 'personal',
    name: 'Starter Linux VPS',
    specs: { cpu: '1 vCPU', ram: '2GB RAM', storage: '30GB SSD', bandwidth: '1TB Bandwidth' },
    useCaseDescription: 'مثالي للمطورين المبتدئين، تجربة الأكواد، واستضافة المواقع الشخصية الصغيرة.',
    price: 15,
    icon: 'fa-linux'
  },
  {
    id: 2,
    type: 'vps',
    usage: 'business',
    name: 'Corporate Ubuntu VPS',
    specs: { cpu: '4 vCPU', ram: '8GB RAM', storage: '100GB SSD', bandwidth: '5TB Bandwidth' },
    useCaseDescription: 'مصمم خصيصاً للمتاجر الإلكترونية، أنظمة الشركات، وقواعد البيانات النشطة.',
    price: 35,
    icon: 'fa-server'
  },
  {
    id: 3,
    type: 'vps-nvme',
    usage: 'business',
    name: 'MaxSpeed NVMe Pro',
    specs: { cpu: '6 vCPU', ram: '16GB RAM', storage: '150GB NVMe', bandwidth: '10TB Bandwidth' },
    useCaseDescription: 'سيرفر فائق السرعة مخصص للتطبيقات الضخمة التي تتطلب قراءة وكتابة مكثفة للبيانات.',
    price: 55,
    icon: 'fa-microchip'
  },
  {
    id: 4,
    type: 'cloud',
    usage: 'enterprise',
    name: 'Enterprise Cloud Elastic',
    specs: { cpu: '8 vCPU', ram: '32GB RAM', storage: '300GB NVMe', bandwidth: 'Unlimited' },
    useCaseDescription: 'بنية تحتية سحابية مرنة وقابلة للتوسع الفوري للشركات الكبرى والمؤسسات.',
    price: 99,
    icon: 'fa-cloud'
  },
  {
    id: 5,
    type: 'windows',
    usage: 'personal',
    name: 'Windows Remote Desktop',
    specs: { cpu: '2 vCPU', ram: '4GB RAM', storage: '60GB SSD', bandwidth: '2TB Bandwidth' },
    useCaseDescription: 'سيرفر ويندوز بواجهة سطح مكتب عن بعد (RDP) لتشغيل البرامج والأدوات المستمرة.',
    price: 25,
    icon: 'fa-brands fa-windows'
  },
  {
    id: 6,
    type: 'windows',
    usage: 'business',
    name: 'Windows SQL Server Edition',
    specs: { cpu: '8 vCPU', ram: '24GB RAM', storage: '200GB NVMe', bandwidth: '8TB Bandwidth' },
    useCaseDescription: 'بيئة سيرفر ويندوز متكاملة ومحمية لإدارة خوادم ASP.NET وقواعد بيانات SQL Server.',
    price: 75,
    icon: 'fa-brands fa-windows'
  }
];

export default serversData; // 🌟 السر هنا: تصدير افتراضي صريح
