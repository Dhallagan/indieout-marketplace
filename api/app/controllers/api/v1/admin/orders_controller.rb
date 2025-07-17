module Api
  module V1
    module Admin
      class OrdersController < ApplicationController
        before_action :authenticate_user!
        before_action :require_system_admin!

        # GET /api/v1/admin/orders
        def index
          orders = Order.includes(:user, :store, :order_items).recent

          # Filter by status if provided
          orders = orders.by_status(params[:status]) if params[:status].present?

          # Filter by store if provided
          orders = orders.where(store_id: params[:store_id]) if params[:store_id].present?

          # Filter by payment status if provided
          orders = orders.where(payment_status: params[:payment_status]) if params[:payment_status].present?

          # Search functionality
          if params[:search].present?
            search_term = "%#{params[:search]}%"
            orders = orders.joins(:user).where(
              "order_number ILIKE ? OR users.email ILIKE ? OR users.first_name ILIKE ? OR users.last_name ILIKE ?",
              search_term, search_term, search_term, search_term
            )
          end

          # Date range filtering
          if params[:start_date].present?
            orders = orders.where("created_at >= ?", Date.parse(params[:start_date]).beginning_of_day)
          end
          
          if params[:end_date].present?
            orders = orders.where("created_at <= ?", Date.parse(params[:end_date]).end_of_day)
          end

          # Pagination
          page = params[:page]&.to_i || 1
          per_page = params[:per_page]&.to_i || 20
          per_page = [per_page, 100].min # Max 100 per page

          total_count = orders.count
          orders = orders.limit(per_page).offset((page - 1) * per_page)

          render json: {
            data: OrderSerializer.new(
              orders,
              include: ['user', 'store', 'order_items', 'order_items.product']
            ).serializable_hash,
            meta: {
              current_page: page,
              per_page: per_page,
              total_count: total_count,
              total_pages: (total_count.to_f / per_page).ceil
            }
          }
        end

        # GET /api/v1/admin/orders/stats
        def stats
          # Overall stats
          total_orders = Order.count
          total_revenue = Order.where(payment_status: 'completed').sum(:total_amount)
          
          # Status breakdown
          status_breakdown = Order.group(:status).count
          payment_status_breakdown = Order.group(:payment_status).count

          # Time-based stats (last 30 days)
          thirty_days_ago = 30.days.ago
          recent_orders = Order.where("created_at >= ?", thirty_days_ago).count
          recent_revenue = Order.where("created_at >= ? AND payment_status = ?", thirty_days_ago, 'completed').sum(:total_amount)

          # Daily orders for chart (last 30 days)
          daily_orders = Order
            .where("created_at >= ?", thirty_days_ago)
            .group("DATE(created_at)")
            .count
            .map { |date, count| { date: date, count: count } }

          # Top stores by order count
          top_stores = Store
            .joins(:orders)
            .group("stores.id", "stores.name")
            .order("COUNT(orders.id) DESC")
            .limit(10)
            .pluck("stores.id", "stores.name", "COUNT(orders.id)")
            .map { |id, name, count| { id: id, name: name, order_count: count } }

          render json: {
            total_orders: total_orders,
            total_revenue: total_revenue,
            recent_orders: recent_orders,
            recent_revenue: recent_revenue,
            status_breakdown: status_breakdown,
            payment_status_breakdown: payment_status_breakdown,
            daily_orders: daily_orders,
            top_stores: top_stores
          }
        end

        # PATCH /api/v1/admin/orders/:id/status
        def update_status
          order = Order.find(params[:id])
          
          unless Order.statuses.key?(params[:status])
            return render json: { error: 'Invalid status' }, status: :unprocessable_entity
          end

          if order.update(status: params[:status])
            # Send notification email if status changed
            OrderMailer.order_status_update(order).deliver_later if order.saved_change_to_status?
            
            render json: OrderSerializer.new(
              order.reload,
              include: ['user', 'store', 'order_items']
            )
          else
            render json: { error: order.errors.full_messages.join(', ') }, status: :unprocessable_entity
          end
        end

        # POST /api/v1/admin/orders/:id/refund
        def refund
          order = Order.find(params[:id])
          
          unless order.payment_status == 'completed'
            return render json: { error: 'Can only refund completed payments' }, status: :unprocessable_entity
          end

          begin
            # Process refund through Stripe
            if params[:amount].present?
              # Partial refund
              refund_amount = params[:amount].to_f
              stripe_service = StripePaymentService.new
              stripe_service.refund_payment(order.stripe_payment_intent_id, (refund_amount * 100).to_i)
            else
              # Full refund
              stripe_service = StripePaymentService.new
              stripe_service.refund_payment(order.stripe_payment_intent_id)
            end

            # Update order status
            order.update!(
              status: 'refunded',
              payment_status: 'refunded',
              refunded_at: Time.current,
              refund_amount: params[:amount] || order.total_amount,
              refund_reason: params[:reason]
            )

            # Send refund notification
            OrderMailer.refund_notification(order).deliver_later

            render json: OrderSerializer.new(order.reload)
          rescue StandardError => e
            render json: { error: e.message }, status: :unprocessable_entity
          end
        end

        private

        def require_system_admin!
          unless current_user.system_admin?
            render json: { error: 'Unauthorized' }, status: :forbidden
          end
        end
      end
    end
  end
end