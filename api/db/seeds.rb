# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).

puts "🌱 Seeding database..."

# Helper method for getting product images
def get_product_image(product_name, description, category, style_seed = nil)
  # Use curated Unsplash images
  puts "📷 Using curated image for: #{product_name}"
  case category
  when 'hiking'
    hiking_images = [
      "https://images.unsplash.com/photo-1544966503-7cc5ac882d5c?w=400&h=400&fit=crop", # backpack
      "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=400&fit=crop", # hiking boots
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop", # trekking poles
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=400&fit=crop", # outdoor gear
      "https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?w=400&h=400&fit=crop"  # hiking equipment
    ]
    hiking_images[(style_seed || rand(hiking_images.length)) % hiking_images.length]
  when 'climbing'
    climbing_images = [
      "https://images.unsplash.com/photo-1522163182402-834f871fd851?w=400&h=400&fit=crop", # climbing rope
      "https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=400&h=400&fit=crop", # climbing gear
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop", # carabiners
      "https://images.unsplash.com/photo-1551524164-6cf2ac632fb4?w=400&h=400&fit=crop", # harness
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop"  # ice axe
    ]
    climbing_images[(style_seed || rand(climbing_images.length)) % climbing_images.length]
  when 'camping'
    camping_images = [
      "https://images.unsplash.com/photo-1504851149312-7a075b496cc7?w=400&h=400&fit=crop", # tent
      "https://images.unsplash.com/photo-1487730116645-74489c95b41b?w=400&h=400&fit=crop", # sleeping bag
      "https://images.unsplash.com/photo-1532339142463-fd0a8979791a?w=400&h=400&fit=crop", # camping cookware
      "https://images.unsplash.com/photo-1517824806704-9040b037703b?w=400&h=400&fit=crop", # camp stove
      "https://images.unsplash.com/photo-1434725039720-aaad6dd32dfe?w=400&h=400&fit=crop"  # camping gear
    ]
    camping_images[(style_seed || rand(camping_images.length)) % camping_images.length]
  when 'rafting', 'water_sports'
    water_images = [
      "https://images.unsplash.com/photo-1599207011416-863f6523a085?w=400&h=400&fit=crop", # rafting
      "https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=400&h=400&fit=crop", # kayaking
      "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=400&fit=crop", # paddles
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=400&fit=crop", # life jackets
      "https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=400&h=400&fit=crop"  # river gear
    ]
    water_images[(style_seed || rand(water_images.length)) % water_images.length]
  when 'surfing'
    surf_images = [
      "https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=400&h=400&fit=crop", # surfboards
      "https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=400&h=400&fit=crop", # wetsuit
      "https://images.unsplash.com/photo-1502933691298-84fc14542831?w=400&h=400&fit=crop", # surf wax
      "https://images.unsplash.com/photo-1531722569936-825d3dd91c15?w=400&h=400&fit=crop", # fins
      "https://images.unsplash.com/photo-1459745930869-b3d0d72c3271?w=400&h=400&fit=crop"  # surf gear
    ]
    surf_images[(style_seed || rand(surf_images.length)) % surf_images.length]
  when 'skiing', 'winter_sports'
    ski_images = [
      "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=400&fit=crop", # ski boots
      "https://images.unsplash.com/photo-1605540436563-5bca919ae766?w=400&h=400&fit=crop", # skis
      "https://images.unsplash.com/photo-1511885663737-eea53f6d6187?w=400&h=400&fit=crop", # ski poles
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop", # goggles
      "https://images.unsplash.com/photo-1491555103944-7c647fd857e6?w=400&h=400&fit=crop"  # ski gear
    ]
    ski_images[(style_seed || rand(ski_images.length)) % ski_images.length]
  when 'diving'
    diving_images = [
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=400&fit=crop", # diving mask
      "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=400&fit=crop", # fins
      "https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=400&h=400&fit=crop", # wetsuit
      "https://images.unsplash.com/photo-1544551763-92ab472cad5d?w=400&h=400&fit=crop", # diving gear
      "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=400&h=400&fit=crop"  # underwater camera
    ]
    diving_images[(style_seed || rand(diving_images.length)) % diving_images.length]
  when 'outdoor_art', 'art'
    art_images = [
      "https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=400&h=400&fit=crop", # nature prints
      "https://images.unsplash.com/photo-1578321272176-b7bbc0679853?w=400&h=400&fit=crop", # handmade crafts
      "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=400&h=400&fit=crop", # wood carving
      "https://images.unsplash.com/photo-1515541324332-7dd0c37426e0?w=400&h=400&fit=crop", # nature jewelry
      "https://images.unsplash.com/photo-1524634126442-357e0eac3c14?w=400&h=400&fit=crop"  # trail maps
    ]
    art_images[(style_seed || rand(art_images.length)) % art_images.length]
  when 'store'
    store_images = [
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200&h=200&fit=crop", # outdoor store
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=200&h=200&fit=crop", # mountain logo
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=200&fit=crop"  # gear shop
    ]
    store_images[(style_seed || rand(store_images.length)) % store_images.length]
  else
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop"
  end
end

# Create System Admin
admin = User.find_or_create_by!(email: 'admin@indieout.com') do |user|
  user.password = 'admin123'
  user.password_confirmation = 'admin123'
  user.first_name = 'System'
  user.last_name = 'Admin'
  user.role = :system_admin
  user.email_verified = true
  user.email_verification_token = nil
end

puts "✅ Created system admin: #{admin.email}"

# Create sample categories first
puts "📁 Creating sample categories..."

outdoor_gear = Category.find_or_create_by!(name: 'Outdoor Gear') do |category|
  category.slug = 'outdoor-gear'
  category.description = 'Essential gear for outdoor adventures'
end

# Hiking subcategories
hiking = Category.find_or_create_by!(name: 'Hiking', parent: outdoor_gear) do |category|
  category.slug = 'hiking'
  category.description = 'Hiking and trekking equipment'
end

backpacks_cat = Category.find_or_create_by!(name: 'Backpacks', parent: hiking) do |category|
  category.slug = 'backpacks'
  category.description = 'Hiking backpacks and daypacks'
end

boots_cat = Category.find_or_create_by!(name: 'Hiking Boots', parent: hiking) do |category|
  category.slug = 'hiking-boots'
  category.description = 'Durable boots for trails and mountains'
end

# Climbing subcategories
climbing = Category.find_or_create_by!(name: 'Climbing', parent: outdoor_gear) do |category|
  category.slug = 'climbing'
  category.description = 'Rock climbing and mountaineering gear'
end

ropes_cat = Category.find_or_create_by!(name: 'Ropes', parent: climbing) do |category|
  category.slug = 'ropes'
  category.description = 'Dynamic and static climbing ropes'
end

harnesses_cat = Category.find_or_create_by!(name: 'Harnesses', parent: climbing) do |category|
  category.slug = 'harnesses'
  category.description = 'Climbing harnesses and gear loops'
end

# Camping subcategories
camping = Category.find_or_create_by!(name: 'Camping', parent: outdoor_gear) do |category|
  category.slug = 'camping'
  category.description = 'Camping and overnight gear'
end

tents_cat = Category.find_or_create_by!(name: 'Tents', parent: camping) do |category|
  category.slug = 'tents'
  category.description = 'Backpacking and car camping tents'
end

sleeping_bags_cat = Category.find_or_create_by!(name: 'Sleeping Bags', parent: camping) do |category|
  category.slug = 'sleeping-bags'
  category.description = 'Sleeping bags for all seasons'
end

# Water Sports categories
water_sports = Category.find_or_create_by!(name: 'Water Sports', parent: outdoor_gear) do |category|
  category.slug = 'water-sports'
  category.description = 'Gear for water-based adventures'
end

rafting_cat = Category.find_or_create_by!(name: 'Rafting', parent: water_sports) do |category|
  category.slug = 'rafting'
  category.description = 'Whitewater rafting and kayaking gear'
end

surfing_cat = Category.find_or_create_by!(name: 'Surfing', parent: water_sports) do |category|
  category.slug = 'surfing'
  category.description = 'Surfboards, wetsuits, and surf accessories'
end

diving_cat = Category.find_or_create_by!(name: 'Diving', parent: water_sports) do |category|
  category.slug = 'diving'
  category.description = 'Scuba and freediving equipment'
end

paddling_cat = Category.find_or_create_by!(name: 'Paddling', parent: water_sports) do |category|
  category.slug = 'paddling'
  category.description = 'SUP boards, canoes, and paddles'
end

# Winter Sports categories
winter_sports = Category.find_or_create_by!(name: 'Winter Sports', parent: outdoor_gear) do |category|
  category.slug = 'winter-sports'
  category.description = 'Gear for snow and ice adventures'
end

skiing_cat = Category.find_or_create_by!(name: 'Skiing', parent: winter_sports) do |category|
  category.slug = 'skiing'
  category.description = 'Alpine and backcountry skiing equipment'
end

snowboarding_cat = Category.find_or_create_by!(name: 'Snowboarding', parent: winter_sports) do |category|
  category.slug = 'snowboarding'
  category.description = 'Snowboards, bindings, and accessories'
end

ice_climbing_cat = Category.find_or_create_by!(name: 'Ice Climbing', parent: winter_sports) do |category|
  category.slug = 'ice-climbing'
  category.description = 'Ice axes, crampons, and winter climbing gear'
end

# Outdoor Art & Crafts category
outdoor_art = Category.find_or_create_by!(name: 'Outdoor Art & Crafts', parent: outdoor_gear) do |category|
  category.slug = 'outdoor-art'
  category.description = 'Adventure-inspired art and handmade crafts'
end

photography_cat = Category.find_or_create_by!(name: 'Photography', parent: outdoor_art) do |category|
  category.slug = 'photography'
  category.description = 'Nature photography prints and gear'
end

woodwork_cat = Category.find_or_create_by!(name: 'Woodwork', parent: outdoor_art) do |category|
  category.slug = 'woodwork'
  category.description = 'Hand-carved trail signs and camping crafts'
end

jewelry_cat = Category.find_or_create_by!(name: 'Jewelry', parent: outdoor_art) do |category|
  category.slug = 'jewelry'
  category.description = 'Nature-inspired jewelry and accessories'
end

maps_cat = Category.find_or_create_by!(name: 'Maps & Prints', parent: outdoor_art) do |category|
  category.slug = 'maps-prints'
  category.description = 'Trail maps, topographic prints, and posters'
end

puts "✅ Created #{Category.count} categories"

# Create realistic outdoor stores with sellers
puts "🏪 Creating indie outdoor stores..."

stores_data = [
  {
    name: 'Peak Forge Co.',
    slug: 'peak-forge-co',
    description: 'Handcrafted mountaineering gear from Colorado. Every piece is tested on 14ers and built to last a lifetime. We believe in making gear that enhances your adventure, not weighs it down.',
    website: 'https://peakforge.co',
    specialty: 'climbing',
    seller: {
      first_name: 'Alex',
      last_name: 'Rivera',
      email: 'alex@peakforge.co'
    }
  },
  {
    name: 'Wildland Threads',
    slug: 'wildland-threads',
    description: 'Sustainable outdoor apparel made from recycled materials. Based in Portland, we create technical clothing that performs in the mountains and looks good in the city.',
    website: 'https://wildlandthreads.com',
    specialty: 'hiking',
    seller: {
      first_name: 'Maya',
      last_name: 'Chen',
      email: 'maya@wildlandthreads.com'
    }
  },
  {
    name: 'Backcountry Craft',
    slug: 'backcountry-craft',
    description: 'Ultralight gear designed by thru-hikers, for thru-hikers. Our team has collectively walked over 50,000 miles on long-distance trails, and every product reflects that experience.',
    website: 'https://backcountrycraft.com',
    specialty: 'hiking',
    seller: {
      first_name: 'Jordan',
      last_name: 'Taylor',
      email: 'jordan@backcountrycraft.com'
    }
  },
  {
    name: 'Stone & Sky Gear',
    slug: 'stone-sky-gear',
    description: 'Premium camping equipment for the discerning adventurer. We source the finest materials and work with master craftspeople to create gear that will last generations.',
    website: 'https://stoneskygear.com',
    specialty: 'camping',
    seller: {
      first_name: 'Sam',
      last_name: 'Rodriguez',
      email: 'sam@stoneskygear.com'
    }
  },
  {
    name: 'Trail Maven',
    slug: 'trail-maven',
    description: 'Innovative solutions for modern adventurers. We design gear that solves real problems encountered on the trail, from the Pacific Crest Trail to the local peaks.',
    website: 'https://trailmaven.co',
    specialty: 'hiking',
    seller: {
      first_name: 'Casey',
      last_name: 'Parker',
      email: 'casey@trailmaven.co'
    }
  },
  {
    name: 'Alpine Artisans',
    slug: 'alpine-artisans',
    description: 'Boutique climbing gear crafted in Chamonix. Each piece is individually inspected and carries the heritage of Alpine climbing traditions mixed with modern innovation.',
    website: 'https://alpineartisans.fr',
    specialty: 'climbing',
    seller: {
      first_name: 'Émile',
      last_name: 'Dubois',
      email: 'emile@alpineartisans.fr'
    }
  },
  {
    name: 'Desert Nomad Co.',
    slug: 'desert-nomad-co',
    description: 'Gear tested in the harshest environments. From Death Valley to the Sahara, our products are designed for extreme conditions and minimalist adventures.',
    website: 'https://desertnomad.co',
    specialty: 'camping',
    seller: {
      first_name: 'Zara',
      last_name: 'Hassan',
      email: 'zara@desertnomad.co'
    }
  },
  {
    name: 'Ridge Runner Supply',
    slug: 'ridge-runner-supply',
    description: 'Family-owned business creating durable outdoor gear since 1985. Three generations of mountaineers have poured their knowledge into every product we make.',
    website: 'https://ridgerunner.com',
    specialty: 'hiking',
    seller: {
      first_name: 'David',
      last_name: 'Morrison',
      email: 'david@ridgerunner.com'
    }
  },
  {
    name: 'Tidal Force Gear',
    slug: 'tidal-force-gear',
    description: 'Premium surf and water sports equipment designed by professional athletes. From big wave boards to river rafting gear, we build equipment for those who push boundaries on the water.',
    website: 'https://tidalforcegear.com',
    specialty: 'surfing',
    seller: {
      first_name: 'Kai',
      last_name: 'Nakamura',
      email: 'kai@tidalforcegear.com'
    }
  },
  {
    name: 'Whitewater Works',
    slug: 'whitewater-works',
    description: 'Specialized rafting and kayaking gear built by river guides. We test our equipment on Class V rapids to ensure it performs when it matters most.',
    website: 'https://whitewaterworks.com',
    specialty: 'rafting',
    seller: {
      first_name: 'River',
      last_name: 'Johnson',
      email: 'river@whitewaterworks.com'
    }
  },
  {
    name: 'Powder Dreams Co.',
    slug: 'powder-dreams-co',
    description: 'Backcountry skiing and splitboarding gear for powder chasers. Designed in the Rockies, tested in Japan, and built for adventure anywhere snow falls.',
    website: 'https://powderdreams.co',
    specialty: 'skiing',
    seller: {
      first_name: 'Aspen',
      last_name: 'Williams',
      email: 'aspen@powderdreams.co'
    }
  },
  {
    name: 'Deep Blue Diving',
    slug: 'deep-blue-diving',
    description: 'Professional diving equipment and custom wetsuits. From tropical reefs to arctic expeditions, our gear is trusted by marine biologists and underwater photographers worldwide.',
    website: 'https://deepbluediving.com',
    specialty: 'diving',
    seller: {
      first_name: 'Marina',
      last_name: 'Torres',
      email: 'marina@deepbluediving.com'
    }
  },
  {
    name: 'Trail Canvas Studio',
    slug: 'trail-canvas-studio',
    description: 'Nature-inspired art and handcrafted outdoor decor. We create custom trail maps, topographic prints, and woodwork that brings the beauty of the outdoors into your home.',
    website: 'https://trailcanvas.studio',
    specialty: 'outdoor_art',
    seller: {
      first_name: 'Sierra',
      last_name: 'Martinez',
      email: 'sierra@trailcanvas.studio'
    }
  },
  {
    name: 'Mountain Muse Gallery',
    slug: 'mountain-muse-gallery',
    description: 'Photography prints and outdoor-themed jewelry. Each piece tells a story of adventure and connects you to the wild places that inspire us all.',
    website: 'https://mountainmuse.gallery',
    specialty: 'outdoor_art',
    seller: {
      first_name: 'Luna',
      last_name: 'Anderson',
      email: 'luna@mountainmuse.gallery'
    }
  }
]

stores = []
sellers = []

stores_data.each_with_index do |store_data, index|
  # Create seller
  seller = User.find_or_create_by!(email: store_data[:seller][:email]) do |user|
    user.password = 'seller123'
    user.password_confirmation = 'seller123'
    user.first_name = store_data[:seller][:first_name]
    user.last_name = store_data[:seller][:last_name]
    user.role = :seller_admin
    user.email_verified = true
    user.email_verification_token = nil
  end
  
  sellers << seller
  
  # Create store
  store = Store.find_or_create_by!(name: store_data[:name], owner: seller) do |s|
    s.slug = store_data[:slug]
    s.description = store_data[:description]
    s.website = store_data[:website]
    s.is_verified = true
    s.is_active = true
    s.commission_rate = 0.05
    s.logo = get_product_image(store_data[:name], store_data[:description], 'store', index + 100)
  end
  
  stores << { store: store, specialty: store_data[:specialty] }
  puts "✅ Created store: #{store.name} (#{seller.first_name} #{seller.last_name})"
end

# Create realistic products for each store
puts "🎒 Creating epic outdoor products..."

products_data = [
  # Peak Forge Co. - Climbing gear
  {
    name: 'Apex Dynamic Rope 9.8mm',
    slug: 'apex-dynamic-rope-98mm',
    description: 'Professional-grade dynamic climbing rope engineered for multi-pitch routes and big walls. Featuring our proprietary DryCore treatment that repels water while maintaining suppleness. UIAA certified with exceptional handling characteristics.',
    short_description: 'Professional 9.8mm dynamic rope with DryCore treatment',
    base_price: 189.99,
    compare_at_price: 229.99,
    category: ropes_cat,
    specialty: 'climbing',
    is_featured: true,
    materials: ['Nylon Core', 'Polyester Sheath', 'DryCore Treatment'],
    dimensions: '60m x 9.8mm',
    weight: 4.2,
    sku: 'PF-APEX-98-60'
  },
  {
    name: 'Summit Pro Harness',
    slug: 'summit-pro-harness',
    description: 'Ultra-comfortable harness designed for long alpine routes. Features four gear loops, belay loop rated to 25kN, and our exclusive FlexFit waistbelt that moves with your body on challenging terrain.',
    short_description: 'Professional alpine harness with FlexFit technology',
    base_price: 89.99,
    category: harnesses_cat,
    specialty: 'climbing',
    materials: ['Dyneema', 'Nylon Webbing', 'Aluminum Buckles'],
    weight: 0.8,
    sku: 'PF-SUMMIT-PRO'
  },
  
  # Wildland Threads - Sustainable hiking gear
  {
    name: 'EcoTrail Daypack 25L',
    slug: 'ecotrail-daypack-25l',
    description: 'Sustainable daypack made from 100% recycled ocean plastic. Features a hydration sleeve, multiple organization pockets, and our signature comfort-fit shoulder straps. Carbon neutral shipping included.',
    short_description: 'Sustainable 25L daypack from recycled ocean plastic',
    base_price: 79.99,
    compare_at_price: 89.99,
    category: backpacks_cat,
    specialty: 'hiking',
    is_featured: true,
    materials: ['Recycled Ocean Plastic', 'Organic Cotton Lining', 'Recycled Aluminum Hardware'],
    dimensions: '18" x 12" x 8"',
    weight: 1.4,
    sku: 'WT-ECO-25L'
  },
  {
    name: 'TrailBlazer Merino Tee',
    slug: 'trailblazer-merino-tee',
    description: 'Premium merino wool t-shirt that naturally resists odors and regulates temperature. Ethically sourced from New Zealand sheep farms with fair trade certification.',
    short_description: 'Premium merino wool hiking t-shirt',
    base_price: 68.00,
    category: hiking,
    specialty: 'hiking',
    materials: ['100% Merino Wool', 'Flat-lock Seams'],
    weight: 0.3,
    sku: 'WT-MERINO-TEE'
  },
  
  # Backcountry Craft - Ultralight gear
  {
    name: 'Ultralight Thru-Hiker Pack 40L',
    slug: 'ultralight-thru-hiker-pack-40l',
    description: 'Weighing just 1.8 lbs, this frameless pack is designed for serious mile-crushers. Features include a roll-top closure, removable hip belt, and external gear attachment points. Tested on the PCT, AT, and CDT.',
    short_description: 'Ultra-lightweight 40L frameless backpack for thru-hiking',
    base_price: 245.00,
    category: backpacks_cat,
    specialty: 'hiking',
    is_featured: true,
    materials: ['Dyneema Composite Fabric', 'Ultra-High Molecular Weight Polyethylene'],
    dimensions: '22" x 12" x 10"',
    weight: 1.8,
    sku: 'BC-UL-THRU-40L'
  },
  {
    name: 'Featherweight Trekking Poles',
    slug: 'featherweight-trekking-poles',
    description: 'Carbon fiber trekking poles that collapse to just 15 inches. Cork grips provide excellent comfort on long days. Tungsten carbide tips bite into any terrain.',
    short_description: 'Ultra-light carbon fiber trekking poles',
    base_price: 159.99,
    category: hiking,
    specialty: 'hiking',
    materials: ['Carbon Fiber', 'Cork Grips', 'Tungsten Carbide Tips'],
    weight: 0.7,
    sku: 'BC-FEATHER-POLES'
  },
  
  # Stone & Sky Gear - Premium camping
  {
    name: 'Alpine Sanctuary 2P Tent',
    slug: 'alpine-sanctuary-2p-tent',
    description: 'Four-season mountaineering tent built to withstand extreme weather. Double-wall construction with full vestibule. Hand-selected materials and lifetime craftsmanship warranty.',
    short_description: 'Premium 4-season mountaineering tent',
    base_price: 649.99,
    category: tents_cat,
    specialty: 'camping',
    is_featured: true,
    materials: ['Ripstop Nylon', 'Aluminum Poles', 'YKK Zippers'],
    dimensions: '90" x 52" x 42"',
    weight: 4.8,
    sku: 'SS-ALPINE-SANCT-2P'
  },
  {
    name: 'Expedition Down Sleeping Bag -20°F',
    slug: 'expedition-down-sleeping-bag-20f',
    description: 'Premium 850-fill goose down sleeping bag rated to -20°F. Ethically sourced down with hydrophobic treatment. Includes compression stuff sack and storage bag.',
    short_description: 'Premium -20°F down sleeping bag with 850-fill power',
    base_price: 489.99,
    category: sleeping_bags_cat,
    specialty: 'camping',
    materials: ['850-Fill Goose Down', 'Pertex Quantum Shell', 'YKK Zippers'],
    weight: 3.2,
    sku: 'SS-EXP-DOWN-20F'
  },
  
  # Trail Maven - Innovative solutions
  {
    name: 'Modular Trail Kitchen',
    slug: 'modular-trail-kitchen',
    description: 'Revolutionary cooking system that nests perfectly and weighs just 12 oz. Includes pot, pan, bowl, spork, and integrated wind screen. Designed by PCT thru-hikers.',
    short_description: 'Ultra-light modular cooking system for backpacking',
    base_price: 89.99,
    category: camping,
    specialty: 'hiking',
    materials: ['Titanium', 'Silicone', 'Anodized Aluminum'],
    weight: 0.75,
    sku: 'TM-MOD-KITCHEN'
  },
  {
    name: 'Smart Water Filter 2.0',
    slug: 'smart-water-filter-20',
    description: 'Next-generation water filter that removes 99.9% of bacteria and parasites. Flow rate of 1L per minute. Lifetime of 10,000 gallons with our replaceable cartridge system.',
    short_description: 'High-flow water filter with 10,000 gallon capacity',
    base_price: 129.99,
    compare_at_price: 149.99,
    category: hiking,
    specialty: 'hiking',
    is_featured: true,
    materials: ['Hollow Fiber Membrane', 'BPA-Free Plastic', 'Silicone Seals'],
    weight: 0.4,
    sku: 'TM-SMART-FILTER-2'
  },
  
  # Alpine Artisans - Boutique climbing
  {
    name: 'Chamonix Ice Axe',
    slug: 'chamonix-ice-axe',
    description: 'Hand-forged ice axe crafted in the tradition of Chamonix guides. Carbon fiber shaft with hand-shaped steel head. Each axe is individually numbered and comes with a certificate of authenticity.',
    short_description: 'Hand-forged ice axe from Chamonix artisans',
    base_price: 289.99,
    category: climbing,
    specialty: 'climbing',
    materials: ['Carbon Fiber Shaft', 'Hand-forged Steel Head', 'Leather Grip'],
    dimensions: '60cm',
    weight: 1.1,
    sku: 'AA-CHAM-ICE-60'
  },
  {
    name: 'Mont Blanc Quickdraw Set',
    slug: 'mont-blanc-quickdraw-set',
    description: 'Set of 6 lightweight quickdraws designed for alpine routes. Features our signature bent-gate carabiners and 12cm Dyneema slings. Trusted by IFMGA guides.',
    short_description: 'Professional quickdraw set for alpine climbing',
    base_price: 159.99,
    category: climbing,
    specialty: 'climbing',
    materials: ['7075 Aluminum', 'Dyneema Slings', 'Anodized Finish'],
    weight: 0.9,
    sku: 'AA-MB-QDRAW-SET'
  },
  
  # Desert Nomad Co. - Extreme conditions
  {
    name: 'Sahara Shelter Ultralight',
    slug: 'sahara-shelter-ultralight',
    description: 'Single-wall shelter designed for desert expeditions. Reflects 95% of solar radiation while providing excellent ventilation. Setup time under 2 minutes.',
    short_description: 'Ultra-light desert shelter with solar reflection',
    base_price: 199.99,
    category: tents_cat,
    specialty: 'camping',
    materials: ['Reflective Mylar', 'Ripstop Nylon', 'Carbon Fiber Poles'],
    dimensions: '84" x 36" x 34"',
    weight: 1.9,
    sku: 'DN-SAHARA-UL'
  },
  {
    name: 'Oasis Water Storage System',
    slug: 'oasis-water-storage-system',
    description: 'Collapsible 10L water storage with built-in filtration. Designed for multi-day desert crossings where water sources are scarce. Includes solar shower attachment.',
    short_description: '10L collapsible water storage with integrated filter',
    base_price: 79.99,
    category: camping,
    specialty: 'camping',
    materials: ['Food-Grade TPU', 'Carbon Filter', 'Webbing Straps'],
    weight: 0.6,
    sku: 'DN-OASIS-10L'
  },
  
  # Ridge Runner Supply - Traditional quality
  {
    name: 'Heritage Mountain Boots',
    slug: 'heritage-mountain-boots',
    description: 'Full-grain leather boots handcrafted in our Colorado workshop. Vibram soles, waterproof construction, and traditional craftsmanship. Resoleable and built to last decades.',
    short_description: 'Handcrafted leather mountain boots with Vibram soles',
    base_price: 349.99,
    category: boots_cat,
    specialty: 'hiking',
    is_featured: true,
    materials: ['Full-Grain Leather', 'Vibram Sole', 'Gore-Tex Lining'],
    weight: 2.8,
    sku: 'RR-HERITAGE-BOOT'
  },
  {
    name: 'Classic Canvas Pack 35L',
    slug: 'classic-canvas-pack-35l',
    description: 'Traditional canvas backpack with modern internal frame. Waxed canvas exterior ages beautifully and becomes more water-resistant over time. Leather trim and brass hardware.',
    short_description: 'Traditional waxed canvas pack with leather trim',
    base_price: 189.99,
    category: backpacks_cat,
    specialty: 'hiking',
    materials: ['Waxed Canvas', 'Full-Grain Leather', 'Brass Hardware'],
    dimensions: '20" x 14" x 8"',
    weight: 2.4,
    sku: 'RR-CANVAS-35L'
  }
]

# Create products and assign to appropriate stores
products_data.each_with_index do |product_data, index|
  # Find store based on specialty
  store_info = stores.find { |s| s[:specialty] == product_data[:specialty] }
  next unless store_info
  
  store = store_info[:store]
  
  product = Product.find_or_create_by!(name: product_data[:name], store: store) do |p|
    p.slug = product_data[:slug]
    p.description = product_data[:description]
    p.short_description = product_data[:short_description]
    p.base_price = product_data[:base_price]
    p.compare_at_price = product_data[:compare_at_price]
    p.category = product_data[:category]
    p.sku = product_data[:sku]
    p.track_inventory = true
    p.inventory = rand(5..25)
    p.low_stock_threshold = 5
    p.weight = product_data[:weight]
    p.dimensions = product_data[:dimensions]
    p.materials = product_data[:materials]
    p.status = :active
    p.is_featured = product_data[:is_featured] || false
    # Images will be created as ProductImage records after product creation
  end
  
  # Create ProductImage records
  image_urls = [
    get_product_image(product_data[:name], product_data[:description], product_data[:specialty], index),
    get_product_image(product_data[:name], product_data[:description], product_data[:specialty], index + 50),
    get_product_image(product_data[:name], product_data[:description], product_data[:specialty], index + 100)
  ]
  
  image_urls.each_with_index do |image_url, img_index|
    # Extract file ID from URL
    file_id = if image_url.include?('/uploads/store/')
      image_url.split('/uploads/store/').last
    elsif image_url.include?('/uploads/')
      image_url.split('/uploads/').last
    else
      image_url
    end
    
    ProductImage.create!(
      id: SecureRandom.uuid,
      product_id: product.id,
      position: img_index + 1,
      image_data: {
        'id' => file_id,
        'storage' => 'store',
        'metadata' => {
          'filename' => file_id.split('/').last
        }
      }.to_json
    )
  end
  
  puts "📦 Created product: #{product.name} (#{store.name})"
end

# Create some customer users
puts "👥 Creating sample customers..."

customers_data = [
  { first_name: 'Emma', last_name: 'Wilson', email: 'emma@example.com' },
  { first_name: 'Jake', last_name: 'Anderson', email: 'jake@example.com' },
  { first_name: 'Sofia', last_name: 'Martinez', email: 'sofia@example.com' },
  { first_name: 'Ryan', last_name: 'Thompson', email: 'ryan@example.com' }
]

customers_data.each do |customer_data|
  User.find_or_create_by!(email: customer_data[:email]) do |user|
    user.password = 'customer123'
    user.password_confirmation = 'customer123'
    user.first_name = customer_data[:first_name]
    user.last_name = customer_data[:last_name]
    user.role = :consumer
    user.email_verified = true
    user.email_verification_token = nil
  end
  puts "👤 Created customer: #{customer_data[:first_name]} #{customer_data[:last_name]}"
end

# Create sample banners
puts "\n🎨 Creating sample banners..."

banners_data = [
  {
    title: 'Summer Adventure Sale',
    subtitle: 'Up to 40% Off Premium Gear',
    description: 'Gear up for your next big adventure with hand-picked equipment from independent outdoor makers.',
    cta_text: 'Shop Sale',
    cta_url: '/shop?featured=true',
    background_color: '#0f766e',
    text_color: '#ffffff',
    position: 1,
    is_active: true
  },
  {
    title: 'New Arrivals from Peak Forge',
    subtitle: 'Handcrafted Climbing Gear',
    description: 'Discover the latest innovations in climbing technology, made by climbers for climbers.',
    cta_text: 'Explore Collection',
    cta_url: '/stores/peak-forge',
    background_color: '#1e40af',
    text_color: '#ffffff',
    position: 2,
    is_active: true
  }
]

banners_data.each do |banner_data|
  banner = Banner.find_or_create_by!(title: banner_data[:title]) do |b|
    b.subtitle = banner_data[:subtitle]
    b.description = banner_data[:description]
    b.cta_text = banner_data[:cta_text]
    b.cta_url = banner_data[:cta_url]
    b.background_color = banner_data[:background_color]
    b.text_color = banner_data[:text_color]
    b.position = banner_data[:position]
    b.is_active = banner_data[:is_active]
    b.created_by = admin.id
  end
  puts "🎨 Created banner: #{banner.title}"
end

# Create default hero content
puts "\n🎨 Creating default hero content..."

hero = HeroContent.find_or_create_by!(title: 'Handcrafted gear for trail-worthy adventures') do |h|
  h.subtitle = ''
  h.description = 'Connect with independent sellers creating durable, sustainable outdoor equipment for your next journey.'
  h.cta_primary_text = 'Explore the marketplace'
  h.cta_primary_url = '/shop'
  h.cta_secondary_text = 'Start selling your gear'
  h.cta_secondary_url = '/apply-to-sell'
  h.is_active = true
end
puts "🏠 Created default hero content: #{hero.title}"

puts "\n🎉 Database seeded successfully!"
puts "📊 Summary:"
puts "  • #{User.count} users (#{User.where(role: :seller_admin).count} sellers, #{User.where(role: :consumer).count} customers)"
puts "  • #{Store.count} indie outdoor stores"
puts "  • #{Category.count} categories"
puts "  • #{Product.count} epic outdoor products"
puts "\n🚀 Ready to explore IndieOut!"
puts "\nLogin credentials:"
puts "  Admin: admin@indieout.com / admin123"
puts "  Sample seller: alex@peakforge.co / seller123"
puts "  Sample customer: emma@example.com / customer123"