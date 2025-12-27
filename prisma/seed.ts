import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create platform settings
  console.log('Creating platform settings...')
  await prisma.platformSettings.upsert({
    where: { id: 'settings' },
    update: {},
    create: {
      id: 'settings',
      marketplaceRate: 0.055, // 5.5%
      freeThreshold: 1000, // R1000
      instantOfferRate: 0.05, // 5%
      escrowReleaseDays: 2,
      platformBankName: 'FNB',
      platformAccountName: 'Flippin (Pty) Ltd',
      platformAccountNumber: '62832145678',
      platformBranchCode: '250655',
    },
  })

  // Create categories
  console.log('Creating categories...')

  const electronics = await prisma.category.upsert({
    where: { slug: 'electronics' },
    update: {},
    create: {
      name: 'Electronics',
      slug: 'electronics',
      description: 'All electronic devices and gadgets',
      icon: '📱',
      keyAttributes: ['brand', 'model', 'condition'],
    },
  })

  const smartphones = await prisma.category.upsert({
    where: { slug: 'smartphones' },
    update: {},
    create: {
      name: 'Smartphones',
      slug: 'smartphones',
      description: 'Mobile phones and smartphones',
      icon: '📱',
      parentId: electronics.id,
      keyAttributes: ['brand', 'model', 'storage', 'color', 'battery_health'],
      qualifyingQuestions: {
        questions: [
          {
            id: 'model',
            text: 'What model is it?',
            type: 'select',
            required: true,
          },
          {
            id: 'storage',
            text: 'Storage capacity?',
            type: 'select',
            options: ['64GB', '128GB', '256GB', '512GB', '1TB'],
            required: true,
          },
          {
            id: 'color',
            text: 'Color?',
            type: 'text',
            required: false,
          },
          {
            id: 'battery_health',
            text: 'Battery health percentage? (Settings > Battery > Battery Health)',
            type: 'number',
            required: true,
          },
          {
            id: 'screen_condition',
            text: 'Any screen cracks or damage?',
            type: 'radio',
            options: ['No damage', 'Minor scratches', 'Cracked screen'],
            required: true,
          },
          {
            id: 'face_id',
            text: 'Face ID / Touch ID working?',
            type: 'radio',
            options: ['Yes', 'No'],
            required: true,
          },
          {
            id: 'icloud',
            text: 'iCloud removed / unlocked?',
            type: 'radio',
            options: ['Yes, unlocked', 'No, still locked'],
            required: true,
            dealBreaker: 'No, still locked',
          },
        ],
      },
    },
  })

  const laptops = await prisma.category.upsert({
    where: { slug: 'laptops' },
    update: {},
    create: {
      name: 'Laptops & Computers',
      slug: 'laptops',
      description: 'Laptops, desktops, and computer accessories',
      icon: '💻',
      parentId: electronics.id,
      keyAttributes: ['brand', 'model', 'processor', 'ram', 'storage'],
      qualifyingQuestions: {
        questions: [
          {
            id: 'model',
            text: 'What model?',
            type: 'text',
            required: true,
          },
          {
            id: 'processor',
            text: 'Processor (e.g., M1, Intel i5)?',
            type: 'text',
            required: false,
          },
          {
            id: 'ram',
            text: 'RAM?',
            type: 'select',
            options: ['4GB', '8GB', '16GB', '32GB', '64GB'],
            required: true,
          },
          {
            id: 'storage',
            text: 'Storage?',
            type: 'select',
            options: ['128GB', '256GB', '512GB', '1TB', '2TB'],
            required: true,
          },
          {
            id: 'screen_damage',
            text: 'Any screen cracks or dead pixels?',
            type: 'radio',
            options: ['No damage', 'Minor scratches', 'Cracks/dead pixels'],
            required: true,
          },
          {
            id: 'keyboard_working',
            text: 'All keys working?',
            type: 'radio',
            options: ['Yes', 'Some keys sticky/broken'],
            required: true,
          },
          {
            id: 'battery_cycles',
            text: 'Battery cycle count? (if known)',
            type: 'number',
            required: false,
          },
        ],
      },
    },
  })

  const gaming = await prisma.category.upsert({
    where: { slug: 'gaming' },
    update: {},
    create: {
      name: 'Gaming',
      slug: 'gaming',
      description: 'Gaming consoles, games, and accessories',
      icon: '🎮',
      parentId: electronics.id,
      keyAttributes: ['brand', 'model', 'storage'],
    },
  })

  const cameras = await prisma.category.upsert({
    where: { slug: 'cameras' },
    update: {},
    create: {
      name: 'Cameras & Photography',
      slug: 'cameras',
      description: 'Cameras, lenses, and photography equipment',
      icon: '📷',
      parentId: electronics.id,
      keyAttributes: ['brand', 'model', 'megapixels'],
    },
  })

  const fashion = await prisma.category.upsert({
    where: { slug: 'fashion' },
    update: {},
    create: {
      name: 'Fashion & Accessories',
      slug: 'fashion',
      description: 'Clothing, shoes, bags, and accessories',
      icon: '👟',
      keyAttributes: ['brand', 'size', 'condition'],
    },
  })

  const sneakers = await prisma.category.upsert({
    where: { slug: 'sneakers' },
    update: {},
    create: {
      name: 'Sneakers',
      slug: 'sneakers',
      description: 'Athletic and casual sneakers',
      icon: '👟',
      parentId: fashion.id,
      keyAttributes: ['brand', 'model', 'size', 'condition'],
    },
  })

  const watches = await prisma.category.upsert({
    where: { slug: 'watches' },
    update: {},
    create: {
      name: 'Watches',
      slug: 'watches',
      description: 'Wristwatches and smartwatches',
      icon: '⌚',
      keyAttributes: ['brand', 'model', 'condition'],
    },
  })

  const home = await prisma.category.upsert({
    where: { slug: 'home-appliances' },
    update: {},
    create: {
      name: 'Home & Kitchen',
      slug: 'home-appliances',
      description: 'Small appliances and kitchen gadgets',
      icon: '🏠',
      keyAttributes: ['brand', 'model', 'condition'],
    },
  })

  const sports = await prisma.category.upsert({
    where: { slug: 'sports-outdoors' },
    update: {},
    create: {
      name: 'Sports & Outdoors',
      slug: 'sports-outdoors',
      description: 'Sporting goods, gym equipment, and outdoor gear',
      icon: '⚽',
      keyAttributes: ['brand', 'type', 'condition'],
    },
  })

  const tools = await prisma.category.upsert({
    where: { slug: 'tools' },
    update: {},
    create: {
      name: 'Tools & Equipment',
      slug: 'tools',
      description: 'Power tools, hand tools, and equipment',
      icon: '🔧',
      parentId: sports.id,
      keyAttributes: ['brand', 'model', 'condition'],
      qualifyingQuestions: {
        questions: [
          {
            id: 'model',
            text: 'What model/type?',
            type: 'text',
            required: true,
          },
          {
            id: 'working_condition',
            text: 'Is it fully functional?',
            type: 'radio',
            options: ['Yes, works perfectly', 'Minor issues', 'Not working'],
            required: true,
          },
          {
            id: 'accessories',
            text: 'Includes original accessories/case?',
            type: 'radio',
            options: ['Yes', 'No'],
            required: false,
          },
        ],
      },
    },
  })

  console.log('✅ Categories created')

  // Create admin user
  console.log('Creating admin user...')
  const adminUser = await prisma.user.upsert({
    where: { email: 'brad@eyre.co.za' },
    update: {},
    create: {
      email: 'brad@eyre.co.za',
      firstName: 'Brad',
      lastName: 'Eyre',
      type: 'ADMIN',
      verified: true,
      verificationLevel: 'PREMIUM',
    },
  })

  console.log('✅ Admin user created')

  // Create Epic Deals instant buyer
  console.log('Creating Epic Deals instant buyer...')
  const epicDealsUser = await prisma.user.upsert({
    where: { email: 'epicdeals@flippin.co.za' },
    update: {},
    create: {
      email: 'epicdeals@flippin.co.za',
      firstName: 'Epic',
      lastName: 'Deals',
      type: 'INSTANT_BUYER',
      companyName: 'Epic Deals',
      verified: true,
      verificationLevel: 'BUSINESS',
    },
  })

  const epicDeals = await prisma.instantBuyer.upsert({
    where: { userId: epicDealsUser.id },
    update: {},
    create: {
      userId: epicDealsUser.id,
      companyName: 'Epic Deals',
      approved: true,
      active: true,
      categories: [smartphones.id, laptops.id, gaming.id, cameras.id, tools.id],
      baseOffer: 0.60, // 60% of market value
      conditionRules: {
        NEW: 1.10,
        LIKE_NEW: 1.05,
        GOOD: 1.0,
        FAIR: 0.85,
        POOR: 0.70,
      },
    },
  })

  console.log('✅ Epic Deals instant buyer created')

  // Create test seller
  console.log('Creating test seller...')
  const testSeller = await prisma.user.upsert({
    where: { email: 'seller@test.com' },
    update: {},
    create: {
      email: 'seller@test.com',
      firstName: 'Test',
      lastName: 'Seller',
      type: 'PERSONAL_SELLER',
      province: 'GAUTENG',
      city: 'Johannesburg',
      bankName: 'FNB',
      accountHolder: 'Test Seller',
      accountNumber: '1234567890',
      branchCode: '250655',
      accountType: 'Cheque',
      bankingVerified: true,
    },
  })

  console.log('✅ Test seller created')

  console.log('')
  console.log('🎉 Seed data created successfully!')
  console.log('')
  console.log('📧 Admin login: brad@eyre.co.za')
  console.log('📧 Test seller: seller@test.com')
  console.log('🏢 Instant buyer: Epic Deals (epicdeals@flippin.co.za)')
  console.log('')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
