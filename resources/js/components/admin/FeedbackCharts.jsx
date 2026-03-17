// components/admin/FeedbackCharts.jsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { Star, TrendingUp, Users, MessageSquare, Download, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];

const questions = [
  { id: 1, text: "Easy Access" },
  { id: 2, text: "Navigation" },
  { id: 3, text: "Organization" },
  { id: 4, text: "Readability" },
  { id: 5, text: "Design" },
  { id: 6, text: "Loading Speed" },
  { id: 7, text: "Mobile Friendly" },
  { id: 8, text: "Visual Elements" },
  { id: 9, text: "Announcements" },
  { id: 10, text: "Project Info" },
  { id: 11, text: "Request Process" },
  { id: 12, text: "Request Status" },
  { id: 13, text: "Instructions" },
  { id: 14, text: "Service Access" },
  { id: 15, text: "KK ID Process" },
  { id: 16, text: "Dashboard" },
  { id: 17, text: "Information Layout" },
  { id: 18, text: "Service Clarity" },
  { id: 19, text: "Confidence" },
  { id: 20, text: "Overall Satisfaction" },
];

const ratingLabels = {
  1: "Poor",
  2: "Fair",
  3: "Good",
  4: "Very Good"
};

export function FeedbackCharts({ feedbackData }) {
  // Add trendDays state
  const [trendDays, setTrendDays] = useState(7);
  
  // Ensure feedbackData is an array
  const safeFeedbackData = Array.isArray(feedbackData) ? feedbackData : [];
  
  // Show loading or empty state
  if (safeFeedbackData.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <AlertCircle className="h-12 w-12 text-muted-foreground" />
            <h3 className="text-lg font-semibold">No Feedback Data</h3>
            <p className="text-muted-foreground">
              No feedback submissions yet. Check back later when users have submitted feedback.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate average ratings per question
  const calculateAverages = () => {
    try {
      const averages = {};
      const counts = {};

      safeFeedbackData.forEach(feedback => {
        if (feedback && feedback.answers && typeof feedback.answers === 'object') {
          Object.entries(feedback.answers).forEach(([questionId, rating]) => {
            if (!averages[questionId]) {
              averages[questionId] = 0;
              counts[questionId] = 0;
            }
            averages[questionId] += Number(rating);
            counts[questionId]++;
          });
        }
      });

      return questions.map((q, index) => ({
        name: q.text,
        average: averages[q.id] ? (averages[q.id] / counts[q.id]).toFixed(2) : 0,
        id: q.id
      }));
    } catch (error) {
      console.error('Error calculating averages:', error);
      return [];
    }
  };

  // Calculate rating distribution
  const calculateDistribution = () => {
    try {
      const distribution = {
        1: 0, 2: 0, 3: 0, 4: 0
      };

      safeFeedbackData.forEach(feedback => {
        if (feedback && feedback.answers && typeof feedback.answers === 'object') {
          Object.values(feedback.answers).forEach(rating => {
            distribution[rating]++;
          });
        }
      });

      return Object.entries(distribution)
        .filter(([_, count]) => count > 0)
        .map(([rating, count]) => ({
          name: ratingLabels[rating],
          value: count,
          rating: parseInt(rating)
        }));
    } catch (error) {
      console.error('Error calculating distribution:', error);
      return [];
    }
  };

// Calculate trend data over time
const calculateTrend = () => {
  try {
    console.log('=== TREND DEBUG START ===');
    console.log('Total feedback items:', safeFeedbackData.length);
    
    if (safeFeedbackData.length === 0) {
      console.log('No feedback data available');
      return [];
    }
    
    const trend = {};
    
    safeFeedbackData.forEach((feedback, index) => {
      console.log(`\nProcessing feedback #${index}:`, feedback);
      
      // Get the date - try multiple possible fields
      let dateStr = null;
      if (feedback.submittedAt) {
        dateStr = feedback.submittedAt;
        console.log('Using submittedAt:', dateStr);
      } else if (feedback.submitted_at) {
        dateStr = feedback.submitted_at;
        console.log('Using submitted_at:', dateStr);
      } else if (feedback.created_at) {
        dateStr = feedback.created_at;
        console.log('Using created_at:', dateStr);
      } else {
        console.log('No date field found in feedback');
        return;
      }
      
      // Parse the date
      const dateObj = new Date(dateStr);
      console.log('Parsed date object:', dateObj);
      console.log('Is valid date?', !isNaN(dateObj.getTime()));
      
      if (isNaN(dateObj.getTime())) {
        console.log('Invalid date format:', dateStr);
        return;
      }
      
      // Use YYYY-MM-DD format for consistent comparison
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');
      const dateKey = `${year}-${month}-${day}`;
      console.log('Formatted date key:', dateKey);
      
      // Calculate average rating for this feedback
      if (feedback.answers && typeof feedback.answers === 'object') {
        console.log('Answers:', feedback.answers);
        const ratings = Object.values(feedback.answers);
        console.log('Ratings:', ratings);
        
        if (ratings.length > 0) {
          const sum = ratings.reduce((a, b) => Number(a) + Number(b), 0);
          const avgRating = sum / ratings.length;
          console.log(`Sum: ${sum}, Count: ${ratings.length}, Avg: ${avgRating}`);
          
          if (!trend[dateKey]) {
            trend[dateKey] = { total: 0, count: 0 };
          }
          
          trend[dateKey].total += avgRating;
          trend[dateKey].count++;
          console.log(`Updated trend for ${dateKey}: total=${trend[dateKey].total}, count=${trend[dateKey].count}`);
        } else {
          console.log('No ratings found');
        }
      } else {
        console.log('No answers object found');
      }
    });

    console.log('\nRaw trend object:', trend);

    // Convert to array and calculate final averages
    const trendArray = Object.entries(trend)
      .map(([date, data]) => {
        const avg = (data.total / data.count).toFixed(2);
        return {
          date, // This is now YYYY-MM-DD format
          average: avg
        };
      })
      .sort((a, b) => a.date.localeCompare(b.date)); // Sort as strings (YYYY-MM-DD works)

    console.log('All trend data (sorted):', trendArray);

    // Filter based on selected days
    let filteredData = [];
    
    if (trendDays === 0) {
      // All data
      filteredData = trendArray;
      console.log('Showing all data:', filteredData.length, 'points');
    } 
    else if (trendDays === 1) {
      // Today only
      const today = new Date();
      const todayYear = today.getFullYear();
      const todayMonth = String(today.getMonth() + 1).padStart(2, '0');
      const todayDay = String(today.getDate()).padStart(2, '0');
      const todayKey = `${todayYear}-${todayMonth}-${todayDay}`;
      
      console.log('Looking for today:', todayKey);
      filteredData = trendArray.filter(item => item.date === todayKey);
      console.log('Found', filteredData.length, 'items for today');
    } 
    else {
      // Last X days
      const today = new Date();
      const cutoffDate = new Date(today);
      cutoffDate.setDate(today.getDate() - trendDays);
      
      // Format cutoff date as YYYY-MM-DD for comparison
      const cutoffYear = cutoffDate.getFullYear();
      const cutoffMonth = String(cutoffDate.getMonth() + 1).padStart(2, '0');
      const cutoffDay = String(cutoffDate.getDate()).padStart(2, '0');
      const cutoffKey = `${cutoffYear}-${cutoffMonth}-${cutoffDay}`;
      
      console.log(`Filtering for last ${trendDays} days (since ${cutoffKey})`);
      filteredData = trendArray.filter(item => item.date >= cutoffKey);
      console.log('Found', filteredData.length, 'items');
    }

    console.log('Final filtered data:', filteredData);
    console.log('=== TREND DEBUG END ===\n');
    
    return filteredData;

  } catch (error) {
    console.error('Error calculating trend:', error);
    return [];
  }
};

  const averages = calculateAverages();
  const distribution = calculateDistribution();
  const trend = calculateTrend();

  const exportToCSV = () => {
    try {
      const headers = ['Date', 'Name', 'Email', 'Comment', ...questions.map(q => q.text)];
      const rows = safeFeedbackData.map(f => [
        f.submittedAt ? new Date(f.submittedAt).toLocaleString() : 'N/A',
        f.name || 'Anonymous',
        f.email || 'N/A',
        f.comment || 'N/A',
        ...questions.map(q => {
          const rating = f.answers && f.answers[q.id];
          return rating ? ratingLabels[rating] || rating : 'N/A';
        })
      ]);

      const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `feedback-export-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Error exporting data. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with export */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Feedback Analytics</h2>
          <p className="text-muted-foreground">
            Total Responses: {safeFeedbackData.length}
          </p>
        </div>
        <Button onClick={exportToCSV} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Data
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="details">Detailed Analysis</TabsTrigger>
          <TabsTrigger value="comments">Comments</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Rating Distribution Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-400" />
                Rating Distribution
              </CardTitle>
              <CardDescription>
                Overall distribution of all ratings
              </CardDescription>
            </CardHeader>
            <CardContent>
              {distribution.length > 0 ? (
                <div style={{ width: '100%', height: '300px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={distribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {distribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No rating data available</p>
              )}
            </CardContent>
          </Card>

          {/* Trend Line Chart */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  Satisfaction Trend
                </CardTitle>
                <CardDescription>
                  Average rating over time
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant={trendDays === 1 ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setTrendDays(1)}
                >
                  Today
                </Button>
                <Button 
                  variant={trendDays === 7 ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setTrendDays(7)}
                >
                  7 Days
                </Button>
                <Button 
                  variant={trendDays === 30 ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setTrendDays(30)}
                >
                  30 Days
                </Button>
                <Button 
                  variant={trendDays === 0 ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setTrendDays(0)}
                >
                  All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {trend.length > 0 ? (
                <div style={{ width: '100%', height: '400px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={trend}
                      margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis 
                        domain={[0, 4]} 
                        tick={{ fontSize: 12 }}
                        ticks={[0, 1, 2, 3, 4]}
                      />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="average" 
                        stroke="#8884d8" 
                        name="Average Rating"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    {trendDays === 1 
                      ? "No data for today yet. Submit some feedback to see the trend!" 
                      : "No trend data available"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Question-wise Analysis</CardTitle>
              <CardDescription>
                Average ratings for each question (1-4 scale)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {averages.length > 0 ? (
                <div style={{ width: '100%', height: '500px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={averages}
                      layout="vertical"
                      margin={{ left: 100 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" domain={[0, 4]} />
                      <YAxis type="category" dataKey="name" width={80} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="average" fill="#8884d8" name="Average Rating" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No question data available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comments">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                User Comments
              </CardTitle>
              <CardDescription>
                Recent feedback and suggestions from users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {safeFeedbackData
                  .filter(f => f.comment && f.comment.trim() !== '')
                  .sort((a, b) => new Date(b.submittedAt || 0) - new Date(a.submittedAt || 0))
                  .map((feedback, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-medium">{feedback.name || 'Anonymous'}</span>
                          <span className="text-sm text-muted-foreground ml-2">
                            {feedback.submittedAt ? new Date(feedback.submittedAt).toLocaleDateString() : 'Unknown date'}
                          </span>
                        </div>
                        {feedback.answers && Object.keys(feedback.answers).length > 0 && (
                          <Badge variant="outline">
                            Avg: {(Object.values(feedback.answers).reduce((a, b) => a + b, 0) / 
                                   Object.values(feedback.answers).length).toFixed(1)}/4
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm">{feedback.comment}</p>
                      {feedback.email && (
                        <p className="text-xs text-muted-foreground">
                          Contact: {feedback.email}
                        </p>
                      )}
                    </div>
                  ))}
                {safeFeedbackData.filter(f => f.comment && f.comment.trim() !== '').length === 0 && (
                  <p className="text-center text-muted-foreground py-4">No comments available</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}