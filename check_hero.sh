#!/bin/bash
set -e

echo "Checking hero content in production database..."
fly ssh console --app indieout <<'EOF'
cd /app/api
bundle exec rails runner "
  puts 'Hero Content Count: ' + HeroContent.count.to_s
  hero = HeroContent.first
  if hero
    puts 'Hero exists with ID: ' + hero.id.to_s
    puts 'Title: ' + hero.title.to_s
    puts 'Active: ' + hero.is_active.to_s
    puts 'Background image data: ' + hero.background_image_data.to_s[0..50] + '...' rescue puts 'No background image'
    puts 'Featured image data: ' + hero.featured_collection_image_data.to_s[0..50] + '...' rescue puts 'No featured image'
  else
    puts 'No hero content found'
  end
"
exit
EOF