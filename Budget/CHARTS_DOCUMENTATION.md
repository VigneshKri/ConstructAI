# 📊 Charts & Visualizations Documentation

## Overview
The Construction Budget Manager now includes comprehensive data visualization capabilities using **Recharts**, providing interactive charts across the Dashboard and Reports pages.

---

## 🎯 Dashboard Charts

### 1. **Expenses by Category (Pie Chart)**
- **Location**: Dashboard → Top Section
- **Purpose**: Visual breakdown of expenses across all categories
- **Features**:
  - Shows top 8 expense categories
  - Interactive labels displaying category name and percentage
  - Color-coded segments for easy identification
  - Hover tooltips showing exact amounts
- **Data Source**: All expenses aggregated by category

### 2. **Project Budget Comparison (Bar Chart)**
- **Location**: Dashboard → Top Section
- **Purpose**: Compare budget allocation vs actual spending per project
- **Features**:
  - Displays top 6 projects
  - Side-by-side bars for Budget and Spent amounts
  - Y-axis formatted in thousands (k) for readability
  - Legend for quick reference
- **Data Source**: Projects with their allocated budgets and calculated expenses

### 3. **Expense Trends - Last 7 Days (Line Chart)**
- **Location**: Dashboard → Middle Section
- **Purpose**: Track daily spending patterns over the past week
- **Features**:
  - Smooth line chart showing daily totals
  - Active dots on hover for precise values
  - Date labels on X-axis (e.g., "Jan 10")
  - Y-axis in thousands for clarity
- **Data Source**: Daily expense aggregations for last 7 days

---

## 📈 Reports Page Charts

### 1. **Expenses by Category (Enhanced Pie Chart)**
- **Location**: Reports → Top Left
- **Purpose**: Detailed category-wise expense distribution with filtering support
- **Features**:
  - Larger radius (100px) for better visibility
  - Shows all categories (up to 10)
  - Label lines for clear identification
  - Tooltips include item count: "Materials: $45,000 (23 items)"
  - Respects date range filter
- **Data Source**: Filtered expenses based on selected date range

### 2. **Capital vs Resource Expenses (Pie Chart)**
- **Location**: Reports → Top Right
- **Purpose**: Compare capital and resource expense allocation
- **Features**:
  - Two-segment pie chart (Capital in blue, Resource in green)
  - Labels show both type name and amount
  - Tooltips include item counts
  - Legend for type identification
- **Data Source**: Expenses grouped by type (capital/resource)

### 3. **Project Budget Analysis (Bar Chart)**
- **Location**: Reports → Middle Section (Full Width)
- **Purpose**: Comprehensive project-by-project budget analysis
- **Features**:
  - Shows up to 8 projects
  - Three bars per project: Budget (green), Spent (red), Remaining (blue)
  - Angled X-axis labels for readability
  - Y-axis in thousands (k)
  - Interactive tooltips with exact values
- **Data Source**: All projects with budget calculations

### 4. **Monthly Expense Trends (Stacked Area Chart)**
- **Location**: Reports → Lower Section (Full Width)
- **Purpose**: Visualize spending patterns over time with type breakdown
- **Features**:
  - Last 6 months of data
  - Stacked areas showing Capital (blue) and Resource (green) expenses
  - Smooth curves for trend visualization
  - Month/year labels (e.g., "Dec 2024")
  - Y-axis in thousands
  - Legend distinguishing expense types
- **Data Source**: Monthly aggregations of expenses by type

---

## 🎨 Chart Styling & Colors

### Color Palette
- **Primary Colors**: `#0088FE` (Blue), `#00C49F` (Green), `#FFBB28` (Yellow), `#FF8042` (Orange)
- **Extended Colors**: `#8884D8`, `#82CA9D`, `#FFC658`, `#FF6B9D`, `#A569BD`, `#45B7D1`
- **Semantic Colors**:
  - Budget: `#4CAF50` (Green)
  - Spent: `#FF6B6B` (Red)
  - Remaining: `#2196F3` (Blue)

### Responsive Design
- All charts use `ResponsiveContainer` from Recharts
- Width: 100% of parent container
- Heights:
  - Pie Charts: 300-350px
  - Bar Charts: 300-400px
  - Line Charts: 250px
  - Area Charts: 350px

---

## 💡 Interactive Features

### Tooltips
- **Hover Activation**: Move mouse over any data point
- **Custom Formatting**: All currency values formatted with `formatCurrency()`
- **Additional Context**: Item counts, percentages, dates

### Legends
- Position: Bottom or right (auto-adjusted)
- Interactive: Click to hide/show data series
- Color-coded to match chart segments

### Labels
- **Pie Charts**: Percentage-based labels with category names
- **Bar/Line Charts**: Axis labels with units (e.g., "$50k")
- **X-Axis**: Angled on bar charts for long project names

---

## 🔄 Data Updates

### Real-Time Updates
All charts automatically update when:
- New expenses are added
- Projects are created or modified
- Expenses are edited or deleted
- Date range filters are changed (Reports page)

### Performance Optimization
- Charts only re-render when relevant data changes
- Data preparation functions are called efficiently
- Top N items shown (e.g., top 8 categories) to prevent overcrowding

---

## 📱 Mobile Responsiveness

All charts are fully responsive:
- Adapt to screen width automatically
- Font sizes adjust for mobile devices
- Touch-friendly tooltips
- Scrollable on small screens if needed

---

## 🛠️ Technical Implementation

### Library
- **Recharts v2.10.3**: React-based charting library
- Built on D3.js for powerful visualizations
- Composable components for flexibility

### Components Used
- `<PieChart>` + `<Pie>`: Category distributions
- `<BarChart>` + `<Bar>`: Budget comparisons
- `<LineChart>` + `<Line>`: Trend analysis
- `<AreaChart>` + `<Area>`: Stacked time-series
- `<ResponsiveContainer>`: Responsive wrapper
- `<Tooltip>`, `<Legend>`, `<CartesianGrid>`: Supporting elements

### Data Preparation
```javascript
// Example: Category data preparation
const getCategoryData = () => {
  const categoryMap = {};
  expenses.forEach(expense => {
    if (!categoryMap[expense.category]) {
      categoryMap[expense.category] = 0;
    }
    categoryMap[expense.category] += expense.amount;
  });
  
  return Object.keys(categoryMap).map(category => ({
    name: category,
    value: categoryMap[category]
  })).sort((a, b) => b.value - a.value).slice(0, 8);
};
```

---

## 🚀 Future Enhancements

### Planned Improvements
1. **Export Charts**: Download charts as PNG/SVG images
2. **Custom Date Ranges**: Pick specific date ranges for analysis
3. **Drill-Down**: Click chart segments to see detailed breakdowns
4. **Comparison Mode**: Compare multiple date ranges side-by-side
5. **Custom Metrics**: User-defined KPIs and custom charts
6. **3D Charts**: Optional 3D pie and bar charts
7. **Animations**: Smooth transitions when data updates
8. **Dashboard Customization**: Drag-and-drop chart arrangement

### Advanced Analytics
- Predictive trends using linear regression
- Anomaly detection for unusual spending
- Budget forecasting based on historical data
- Contractor performance comparisons

---

## 📖 Usage Tips

### Best Practices
1. **Date Range Filtering**: Use the date range dropdown on Reports page to focus analysis
2. **Project Selection**: Click on projects in bar charts to navigate to details
3. **Export Before Analysis**: Download reports for offline review
4. **Regular Monitoring**: Check Dashboard daily for expense trends
5. **Category Review**: Use pie charts to identify top spending areas

### Interpreting Charts
- **Red bars exceeding green bars**: Budget overruns (take action)
- **Steep line chart slopes**: Rapid spending (review immediately)
- **Large pie segments**: Major expense categories (optimize spending)
- **Stacked area growth**: Increasing monthly expenses (adjust budgets)

---

## 🆘 Troubleshooting

### Charts Not Displaying
- **Issue**: Blank chart area
- **Solution**: Ensure there's data (add expenses/projects first)

### Performance Issues
- **Issue**: Slow chart rendering
- **Solution**: Reduce date range or number of projects displayed

### Mobile Display
- **Issue**: Charts too small on mobile
- **Solution**: Rotate device to landscape mode for better view

---

## 📞 Support

For questions about charts and visualizations:
- See main [README.md](README.md) for setup instructions
- Check browser console for any errors
- Ensure Recharts is installed: `npm list recharts`

---

**Last Updated**: January 15, 2026  
**Recharts Version**: 2.10.3  
**Compatible Browsers**: Chrome, Firefox, Safari, Edge (latest versions)
