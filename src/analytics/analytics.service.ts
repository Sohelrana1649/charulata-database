import { Order } from '../models/order.model';
import { Product } from '../models/product.model';
import { User } from '../models/user.model';
import { Review } from '../models/review.model';
import { Category } from '../models/category.model';
import { Notification } from '../models/notification.model';
import { AnalyticsLog } from '../models/analyticsLog.model';

export class AnalyticsService {
  // Helper: Get date range objects
  private static getDateRanges() {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    return {
      now,
      startOfToday,
      startOfThisMonth,
      startOfLastMonth,
      endOfLastMonth
    };
  }

  // 1. Dashboard Overview Card statistics
  static async getDashboardOverview() {
    const { startOfToday, startOfThisMonth, startOfLastMonth, endOfLastMonth } = this.getDateRanges();

    // Aggregation for Total Revenue / Sales
    const revenueStats = await Order.aggregate([
      { $match: { deliveryStatus: { $ne: 'Cancelled' } } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          count: { $sum: 1 }
        }
      }
    ]);

    const grossRevenue = revenueStats[0]?.totalRevenue || 0;
    const totalOrdersCount = revenueStats[0]?.count || 0;

    // Monthly earnings
    const monthlySalesStats = await Order.aggregate([
      {
        $match: {
          deliveryStatus: { $ne: 'Cancelled' },
          createdAt: { $gte: startOfThisMonth }
        }
      },
      {
        $group: {
          _id: null,
          sales: { $sum: '$totalAmount' },
          count: { $sum: 1 }
        }
      }
    ]);

    const thisMonthSales = monthlySalesStats[0]?.sales || 0;
    const thisMonthOrders = monthlySalesStats[0]?.count || 0;

    // Last month earnings (for growth calculation)
    const lastMonthSalesStats = await Order.aggregate([
      {
        $match: {
          deliveryStatus: { $ne: 'Cancelled' },
          createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth }
        }
      },
      {
        $group: {
          _id: null,
          sales: { $sum: '$totalAmount' }
        }
      }
    ]);

    const lastMonthSales = lastMonthSalesStats[0]?.sales || 0;
    
    // Calculate Monthly Growth Percentage
    let salesGrowthPercent = 0;
    if (lastMonthSales > 0) {
      salesGrowthPercent = ((thisMonthSales - lastMonthSales) / lastMonthSales) * 100;
    } else if (thisMonthSales > 0) {
      salesGrowthPercent = 100;
    }

    // Today's orders
    const todayOrdersCount = await Order.countDocuments({
      createdAt: { $gte: startOfToday }
    });

    // Orders by Delivery Statuses
    const pendingCount = await Order.countDocuments({ deliveryStatus: 'Pending' });
    const processingCount = await Order.countDocuments({ deliveryStatus: 'Processing' });
    const packedCount = await Order.countDocuments({ deliveryStatus: 'Packed' });
    const deliveredCount = await Order.countDocuments({ deliveryStatus: 'Delivered' });
    const cancelledCount = await Order.countDocuments({ deliveryStatus: 'Cancelled' });

    // Delivery success rate
    let deliverySuccessRate = 0;
    const resolvedOrders = deliveredCount + cancelledCount;
    if (resolvedOrders > 0) {
      deliverySuccessRate = (deliveredCount / resolvedOrders) * 100;
    }

    // Products statistics
    const totalProducts = await Product.countDocuments();
    const activeProducts = await Product.countDocuments({ isActive: true });
    const outOfStockProducts = await Product.countDocuments({ stockQuantity: 0 });

    // Customers statistics
    const registeredCustomers = await User.countDocuments({ role: 'customer' });
    const newCustomersThisMonth = await User.countDocuments({
      role: 'customer',
      createdAt: { $gte: startOfThisMonth }
    });
    
    // Active users: Users who logged activity in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const activeUsers = await AnalyticsLog.distinct('user', {
      createdAt: { $gte: thirtyDaysAgo }
    }).then((users) => users.length);

    // Net Revenue (only delivered orders)
    const netRevenueStats = await Order.aggregate([
      { $match: { deliveryStatus: 'Delivered' } },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalAmount' } // or subTotal depending on definition
        }
      }
    ]);
    const netRevenue = netRevenueStats[0]?.total || 0;

    // Reviews statistics
    const totalReviews = await Review.countDocuments();
    const pendingReviews = await Review.countDocuments({ status: 'Pending' });
    const averageRatingStats = await Review.aggregate([
      { $match: { status: 'Approved' } },
      {
        $group: {
          _id: null,
          avg: { $avg: '$rating' }
        }
      }
    ]);
    const averageRating = averageRatingStats[0]?.avg || 0;

    // Recharts-ready daily sales breakdown for last 7 days
    const sevenDaysAgo = new Date(startOfToday);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    const dailyStatsAgg = await Order.aggregate([
      {
        $match: {
          deliveryStatus: { $ne: 'Cancelled' },
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Format dailyStats to be gap-filled (so days with 0 sales show up)
    const dailyStats: any[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(sevenDaysAgo);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const match = dailyStatsAgg.find((item) => item._id === dateStr);
      dailyStats.push({
        date: dateStr,
        revenue: match?.revenue || 0,
        orders: match?.orders || 0
      });
    }

    return {
      cards: {
        totalSales: {
          value: grossRevenue,
          growth: Math.round(salesGrowthPercent * 10) / 10,
          dailyStats
        },
        totalOrders: {
          value: totalOrdersCount,
          today: todayOrdersCount,
          monthly: thisMonthOrders
        },
        pendingOrders: {
          value: pendingCount,
          processing: processingCount,
          packed: packedCount
        },
        deliveredOrders: {
          value: deliveredCount,
          successRate: Math.round(deliverySuccessRate * 10) / 10
        },
        totalProducts: {
          value: totalProducts,
          active: activeProducts,
          outOfStock: outOfStockProducts
        },
        totalCustomers: {
          value: registeredCustomers,
          newThisMonth: newCustomersThisMonth,
          active: activeUsers || 1 // fallback to 1 if empty
        },
        totalRevenue: {
          gross: grossRevenue,
          net: netRevenue,
          monthlyEarnings: thisMonthSales
        },
        totalReviews: {
          value: totalReviews,
          averageRating: Math.round(averageRating * 10) / 10,
          pending: pendingReviews
        }
      }
    };
  }

  // 2. Revenue Analytics API: Daily, Weekly, Monthly, Yearly
  static async getRevenueAnalytics(range: string = 'monthly') {
    const now = new Date();
    let groupFormat = '';
    let matchStage: any = { deliveryStatus: { $ne: 'Cancelled' } };

    if (range === 'daily') {
      // Last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      matchStage.createdAt = { $gte: thirtyDaysAgo };
      groupFormat = '%Y-%m-%d';
    } else if (range === 'weekly') {
      // Last 12 weeks
      const twelveWeeksAgo = new Date();
      twelveWeeksAgo.setDate(twelveWeeksAgo.getDate() - 84);
      matchStage.createdAt = { $gte: twelveWeeksAgo };
      groupFormat = '%G-W%V'; // Year and Week
    } else if (range === 'yearly') {
      // Last 5 years
      const fiveYearsAgo = new Date();
      fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);
      matchStage.createdAt = { $gte: fiveYearsAgo };
      groupFormat = '%Y';
    } else {
      // Default: monthly (Last 12 months)
      const twelveMonthsAgo = new Date();
      twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
      twelveMonthsAgo.setDate(1); // Start of month
      matchStage.createdAt = { $gte: twelveMonthsAgo };
      groupFormat = '%b %Y'; // e.g. "Jan 2026"
    }

    const data = await Order.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: { $dateToString: { format: groupFormat, date: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Format response to be Recharts-friendly
    return data.map((item) => ({
      name: item._id,
      revenue: item.revenue,
      orders: item.orders
    }));
  }

  // 3. Sales Chart API: Dynamic sales chart filtering by timeframe (2days, 7days, 14days, 30days, 90days, 1year, all)
  static async getSalesChartData(timeframe: string = '30days') {
    const now = new Date();
    let startDate = new Date();
    let isDaily = true;

    switch (timeframe) {
      case '2days':
        startDate.setDate(now.getDate() - 1);
        startDate.setHours(0, 0, 0, 0);
        isDaily = true;
        break;
      case '7days':
        startDate.setDate(now.getDate() - 6);
        startDate.setHours(0, 0, 0, 0);
        isDaily = true;
        break;
      case '14days':
        startDate.setDate(now.getDate() - 13);
        startDate.setHours(0, 0, 0, 0);
        isDaily = true;
        break;
      case '30days':
        startDate.setDate(now.getDate() - 29);
        startDate.setHours(0, 0, 0, 0);
        isDaily = true;
        break;
      case '90days':
        startDate.setDate(now.getDate() - 89);
        startDate.setHours(0, 0, 0, 0);
        isDaily = true;
        break;
      case '1year':
        startDate.setFullYear(now.getFullYear() - 1);
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);
        isDaily = false;
        break;
      case 'all':
        startDate = new Date(0);
        isDaily = false;
        break;
      default:
        startDate.setDate(now.getDate() - 29);
        startDate.setHours(0, 0, 0, 0);
        isDaily = true;
        break;
    }

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    if (isDaily) {
      const stats = await Order.aggregate([
        {
          $match: {
            deliveryStatus: { $ne: 'Cancelled' },
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
              day: { $dayOfMonth: '$createdAt' }
            },
            sales: { $sum: '$totalAmount' },
            orders: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
      ]);

      return stats.map((item) => {
        const monthLabel = months[item._id.month - 1];
        const dayLabel = String(item._id.day).padStart(2, '0');
        const dateStr = `${monthLabel} ${dayLabel}`;
        return {
          date: dateStr,
          month: dateStr,
          sales: item.sales,
          revenue: item.sales,
          orders: item.orders
        };
      });
    } else {
      const stats = await Order.aggregate([
        {
          $match: {
            deliveryStatus: { $ne: 'Cancelled' },
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            sales: { $sum: '$totalAmount' },
            orders: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]);

      return stats.map((item) => {
        const monthLabel = months[item._id.month - 1];
        const dateStr = `${monthLabel} ${item._id.year.toString().slice(-2)}`;
        return {
          date: dateStr,
          month: dateStr,
          sales: item.sales,
          revenue: item.sales,
          orders: item.orders
        };
      });
    }
  }

  // 4. Orders Analytics API
  static async getOrdersAnalytics() {
    const stats = await Order.aggregate([
      {
        $group: {
          _id: '$deliveryStatus',
          count: { $sum: 1 },
          value: { $sum: '$totalAmount' }
        }
      }
    ]);

    // Format as simple states dictionary
    const statuses = ['Pending', 'Confirmed', 'Processing', 'Packed', 'Shipped', 'Out for delivery', 'Delivered', 'Cancelled'];
    const result: Record<string, { count: number; value: number }> = {};
    
    statuses.forEach((s) => {
      const match = stats.find((item) => item._id === s);
      result[s.toLowerCase().replace(/\s+/g, '')] = {
        count: match?.count || 0,
        value: match?.value || 0
      };
    });

    return result;
  }

  // 5. Customer Analytics API
  static async getCustomerAnalytics() {
    const { startOfThisMonth } = this.getDateRanges();
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const newUsers = await User.countDocuments({
      role: 'customer',
      createdAt: { $gte: startOfThisMonth }
    });

    // Returning customers: Customers who have placed more than 1 order
    const returningStats = await Order.aggregate([
      { $group: { _id: '$customer', orderCount: { $sum: 1 } } },
      { $match: { orderCount: { $gt: 1 } } },
      { $count: 'returningCount' }
    ]);
    const returningCustomers = returningStats[0]?.returningCount || 0;

    // Active users: placed order or visited in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const activeUsersCount = await AnalyticsLog.distinct('user', {
      createdAt: { $gte: thirtyDaysAgo }
    }).then((u) => u.length);

    return {
      totalCustomers,
      newUsers,
      returningCustomers,
      activeUsers: activeUsersCount || 1
    };
  }

  // 6. Product Analytics API
  static async getProductAnalytics() {
    // 1) Best Selling Products (Quantity-based)
    const bestSellingAgg = await Order.aggregate([
      { $match: { deliveryStatus: { $ne: 'Cancelled' } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          totalQty: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } }
        }
      },
      { $sort: { totalQty: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      { $unwind: '$productDetails' },
      {
        $project: {
          title: '$productDetails.title',
          slug: '$productDetails.slug',
          totalQty: 1,
          totalRevenue: 1
        }
      }
    ]);

    // 2) Low Stock Products
    const lowStockProducts = await Product.find(
      { stockQuantity: { $lte: 5 } },
      { title: 1, slug: 1, stockQuantity: 1, sku: 1 }
    ).sort({ stockQuantity: 1 }).limit(5);

    // 3) Most Viewed Products
    const mostViewedProducts = await Product.find(
      { isActive: true },
      { title: 1, slug: 1, views: 1 }
    ).sort({ views: -1 }).limit(5);

    // 4) Trending Products (Combination of views + orders)
    // For simplicity, we define trending as highest ratings + views
    const trendingProducts = await Product.find(
      { isActive: true },
      { title: 1, slug: 1, views: 1, ratings: 1 }
    ).sort({ 'ratings.average': -1, views: -1 }).limit(5);

    return {
      bestSelling: bestSellingAgg,
      lowStock: lowStockProducts,
      mostViewed: mostViewedProducts,
      trending: trendingProducts
    };
  }

  // 7. Review Analytics API
  static async getReviewAnalytics() {
    const totalReviews = await Review.countDocuments();
    const pendingReviews = await Review.countDocuments({ status: 'Pending' });
    const approvedReviews = await Review.countDocuments({ status: 'Approved' });
    const rejectedReviews = await Review.countDocuments({ status: 'Rejected' });

    const ratingStats = await Review.aggregate([
      { $match: { status: 'Approved' } },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } }
    ]);

    // Format rating distribution
    const distribution: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    ratingStats.forEach((r) => {
      distribution[r._id] = r.count;
    });

    const averageRatingStats = await Review.aggregate([
      { $match: { status: 'Approved' } },
      { $group: { _id: null, avg: { $avg: '$rating' } } }
    ]);
    const averageRating = averageRatingStats[0]?.avg || 0;

    return {
      totalReviews,
      averageRating: Math.round(averageRating * 10) / 10,
      pendingReviews,
      approvedReviews,
      rejectedReviews,
      ratingDistribution: Object.keys(distribution).map((key) => ({
        rating: Number(key),
        count: distribution[Number(key)]
      }))
    };
  }

  // 8. Category Analytics API
  static async getCategoryAnalytics() {
    const categorySales = await Order.aggregate([
      { $match: { deliveryStatus: { $ne: 'Cancelled' } } },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'productInfo'
        }
      },
      { $unwind: '$productInfo' },
      {
        $group: {
          _id: '$productInfo.category',
          salesCount: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } }
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'categoryInfo'
        }
      },
      { $unwind: '$categoryInfo' },
      {
        $project: {
          name: '$categoryInfo.name',
          slug: '$categoryInfo.slug',
          salesCount: 1,
          revenue: 1
        }
      },
      { $sort: { revenue: -1 } }
    ]);

    const topCategories = categorySales.slice(0, 5);
    const mostPurchasedCategory = categorySales[0] || null;

    return {
      categorySales,
      topCategories,
      mostPurchasedCategory
    };
  }

  // 9. Recent Orders API
  static async getRecentOrders() {
    const orders = await Order.find()
      .populate('customer', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    return orders.map((o) => ({
      id: o._id,
      orderId: o.orderId,
      customerName: (o.customer as any)?.name || 'Guest Customer',
      productCount: o.items.reduce((acc, item) => acc + item.quantity, 0),
      totalAmount: o.totalAmount,
      codStatus: 'Cash On Delivery',
      deliveryStatus: o.deliveryStatus,
      orderDate: o.createdAt
    }));
  }

  // 10. Notification Analytics API
  static async getNotificationAnalytics() {
    const newOrderAlerts = await Notification.find({ type: 'NewOrder' }).sort({ createdAt: -1 }).limit(10);
    const stockAlerts = await Notification.find({ type: 'StockAlert' }).sort({ createdAt: -1 }).limit(10);
    const userActivityAlerts = await Notification.find({ type: 'UserActivity' }).sort({ createdAt: -1 }).limit(10);

    return {
      newOrderAlerts,
      stockAlerts,
      userActivityAlerts
    };
  }

  // Extra: Export Analytics data helper
  static async getExportAnalyticsData() {
    const overview = await this.getDashboardOverview();
    const categories = await this.getCategoryAnalytics();
    const products = await this.getProductAnalytics();
    const reviews = await this.getReviewAnalytics();

    return {
      exportTimestamp: new Date(),
      dashboardSummary: overview.cards,
      categoryPerformances: categories.categorySales,
      bestSellers: products.bestSelling,
      reviewsSummary: {
        totalReviews: reviews.totalReviews,
        avgRating: reviews.averageRating
      }
    };
  }
}
