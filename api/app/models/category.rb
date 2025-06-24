class Category < ApplicationRecord
  # Associations - hierarchical structure
  belongs_to :parent, class_name: 'Category', optional: true
  has_many :children, class_name: 'Category', foreign_key: 'parent_id', dependent: :destroy
  has_many :products, dependent: :destroy

  # Validations
  validates :name, presence: true, length: { minimum: 2, maximum: 100 }
  validates :slug, presence: true, uniqueness: { case_sensitive: false }, format: { with: /\A[a-z0-9\-_]+\z/, message: "only allows lowercase letters, numbers, hyphens, and underscores" }

  # Callbacks
  before_validation :generate_slug, if: -> { slug.blank? && name.present? }
  before_create :set_cuid_id

  # Scopes
  scope :top_level, -> { where(parent_id: nil) }
  scope :with_children, -> { includes(:children) }

  # Instance methods
  def top_level?
    parent_id.nil?
  end

  def has_children?
    children.any?
  end

  def depth
    return 0 if parent_id.nil?
    1 + (parent&.depth || 0)
  end

  def full_path
    return name if parent_id.nil?
    "#{parent.full_path} > #{name}"
  end

  # Get all descendants (children, grandchildren, etc.)
  def descendants
    children + children.flat_map(&:descendants)
  end

  # Get self and all descendants
  def self_and_descendants
    [self] + descendants
  end

  # Get all ancestors (parent, grandparent, etc.)
  def ancestors
    return [] if parent_id.nil?
    [parent] + parent.ancestors
  end

  private

  def generate_slug
    base_slug = name.downcase.gsub(/[^a-z0-9\-_]/, '-').gsub(/-+/, '-').strip('-')
    candidate_slug = base_slug
    counter = 1

    while Category.exists?(slug: candidate_slug)
      candidate_slug = "#{base_slug}-#{counter}"
      counter += 1
    end

    self.slug = candidate_slug
  end

  def set_cuid_id
    self.id = SecureRandom.urlsafe_base64(12) if id.blank?
  end
end
