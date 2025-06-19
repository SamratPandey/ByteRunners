const User = require('../models/User');
const TestResult = require('../models/TestResult');
const Problem = require('../models/Problem');

// Get global leaderboard with comprehensive stats
const getGlobalLeaderboard = async (req, res) => {
  try {
    const { page = 1, limit = 50, timeframe = 'all' } = req.query;
    const skip = (page - 1) * limit;

    // Build date filter based on timeframe
    let dateFilter = {};
    const now = new Date();
    switch (timeframe) {
      case 'week':
        dateFilter = { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) };
        break;
      case 'month':
        dateFilter = { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) };
        break;
      case 'year':
        dateFilter = { $gte: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000) };
        break;
      default:
        dateFilter = null;
    }    // Aggregate user stats
    const leaderboardPipeline = [
      {
        $match: {
          name: { $exists: true, $ne: null, $ne: "" }
        }
      },
      {
        $lookup: {
          from: 'testresults',
          localField: '_id',
          foreignField: 'userId',
          as: 'testResults',
          pipeline: dateFilter ? [{ $match: { completedAt: dateFilter } }] : []
        }
      },
      {
        $lookup: {
          from: 'problems',
          localField: 'solvedProblems.problemId',
          foreignField: '_id',
          as: 'problemDetails'
        }
      },
      {
        $addFields: {
          // Calculate test stats
          totalTests: { $size: '$testResults' },
          averageTestScore: { $avg: '$testResults.score' },
          bestTestScore: { $max: '$testResults.score' },
            // Calculate problem stats
          totalProblemsSolved: { $size: { $ifNull: ['$solvedProblems', []] } },
          easyProblemsSolved: {
            $size: {
              $filter: {
                input: { $ifNull: ['$problemDetails', []] },
                as: 'problem',
                cond: { $eq: ['$$problem.difficulty', 'Easy'] }
              }
            }
          },
          mediumProblemsSolved: {
            $size: {
              $filter: {
                input: { $ifNull: ['$problemDetails', []] },
                as: 'problem',
                cond: { $eq: ['$$problem.difficulty', 'Medium'] }
              }
            }
          },
          hardProblemsSolved: {
            $size: {
              $filter: {
                input: { $ifNull: ['$problemDetails', []] },
                as: 'problem',
                cond: { $eq: ['$$problem.difficulty', 'Hard'] }
              }
            }
          },
          
          // Calculate submission stats
          totalSubmissions: { $size: { $ifNull: ['$submissions', []] } },
          successfulSubmissions: {
            $size: {
              $filter: {
                input: { $ifNull: ['$submissions', []] },
                as: 'sub',
                cond: { $eq: ['$$sub.status', 'Accepted'] }
              }
            }
          },
            // Calculate points based on activity
          totalPoints: {
            $add: [
              { $multiply: ['$experience', 1] }, // Base experience points
              { $multiply: [{ $size: { $ifNull: ['$solvedProblems', []] } }, 10] }, // 10 points per problem
              { $multiply: [{ $ifNull: [{ $avg: '$testResults.score' }, 0] }, 0.5] } // Test score bonus
            ]
          }
        }
      },
      {        $project: {
          _id: 1,
          username: '$name', // Map 'name' field to 'username' for frontend compatibility
          email: 1,
          avatar: 1,
          level: 1,
          experience: 1,
          totalPoints: { $round: ['$totalPoints', 0] },
          totalTests: 1,
          averageTestScore: { $round: [{ $ifNull: ['$averageTestScore', 0] }, 1] },
          bestTestScore: { $ifNull: ['$bestTestScore', 0] },
          totalProblemsSolved: 1,
          easyProblemsSolved: 1,
          mediumProblemsSolved: 1,
          hardProblemsSolved: 1,
          totalSubmissions: 1,
          successfulSubmissions: 1,
          successRate: {
            $round: [
              {
                $multiply: [
                  {
                    $cond: [
                      { $eq: ['$totalSubmissions', 0] },
                      0,
                      { $divide: ['$successfulSubmissions', '$totalSubmissions'] }
                    ]
                  },
                  100
                ]
              },
              1
            ]
          },
          joinedAt: '$createdAt',
          lastActive: '$updatedAt'
        }
      },
      { $sort: { totalPoints: -1, totalProblemsSolved: -1, experience: -1 } },
      { $skip: skip },
      { $limit: parseInt(limit) }
    ];

    const leaderboard = await User.aggregate(leaderboardPipeline);
    
    // Add rank to each user
    const rankedLeaderboard = leaderboard.map((user, index) => ({
      ...user,
      rank: skip + index + 1
    }));    // Get total count for pagination
    const totalUsers = await User.countDocuments({
      name: { $exists: true, $ne: null, $ne: "" }
    });

    res.status(200).json({
      success: true,
      data: {
        leaderboard: rankedLeaderboard,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalUsers,
          pages: Math.ceil(totalUsers / limit)
        },
        timeframe
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leaderboard data',
      error: error.message
    });
  }
};

// Get user's leaderboard position and nearby users
const getUserLeaderboardPosition = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get all users with their stats and rank them
    const allUsersWithStats = await User.aggregate([
      {
        $match: {
          name: { $exists: true, $ne: null, $ne: "" }
        }
      },
      {
        $lookup: {
          from: 'testresults',
          localField: '_id',
          foreignField: 'userId',
          as: 'testResults'
        }
      },
      {
        $addFields: {
          totalPoints: {
            $add: [
              { $multiply: ['$experience', 1] },
              { $multiply: [{ $size: { $ifNull: ['$solvedProblems', []] } }, 10] },
              { $multiply: [{ $ifNull: [{ $avg: '$testResults.score' }, 0] }, 0.5] }
            ]
          },
          totalProblemsSolved: { $size: { $ifNull: ['$solvedProblems', []] } },
          totalTests: { $size: { $ifNull: ['$testResults', []] } }
        }
      },
      {
        $sort: { totalPoints: -1, totalProblemsSolved: -1, experience: -1 }
      },
      {
        $group: {
          _id: null,
          users: { $push: '$$ROOT' }
        }
      },
      {
        $unwind: {
          path: '$users',
          includeArrayIndex: 'rank'
        }
      },
      {
        $addFields: {
          'users.rank': { $add: ['$rank', 1] }
        }
      },
      {
        $replaceRoot: { newRoot: '$users' }
      }
    ]);

    // Find current user's position
    const userPosition = allUsersWithStats.find(user => user._id.toString() === userId);
    
    if (!userPosition) {
      return res.status(404).json({
        success: false,
        message: 'User not found in leaderboard'
      });
    }

    // Get users around current user (5 above and 5 below)
    const currentRank = userPosition.rank;
    const startRank = Math.max(1, currentRank - 5);
    const endRank = currentRank + 5;
    
    const nearbyUsers = allUsersWithStats
      .filter(user => user.rank >= startRank && user.rank <= endRank)      .map(user => ({
        _id: user._id,
        username: user.name, // Using 'name' field as username for frontend compatibility
        avatar: user.avatar,
        level: user.level,
        experience: user.experience,
        totalPoints: Math.round(user.totalPoints),
        totalProblemsSolved: user.totalProblemsSolved,
        totalTests: user.totalTests,
        rank: user.rank,
        isCurrentUser: user._id.toString() === userId
      }));

    res.status(200).json({
      success: true,
      data: {
        currentUser: {
          ...userPosition,
          totalPoints: Math.round(userPosition.totalPoints),
          isCurrentUser: true
        },
        nearbyUsers,
        totalUsers: allUsersWithStats.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user position',
      error: error.message
    });
  }
};

// Get leaderboard by specific category
const getCategoryLeaderboard = async (req, res) => {
  try {
    const { category, page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;

    let pipeline = [];
    let sortCriteria = {};

    switch (category) {      case 'problems':
        pipeline = [
          {
            $addFields: {
              totalProblemsSolved: { $size: { $ifNull: ['$solvedProblems', []] } },
              score: { $size: { $ifNull: ['$solvedProblems', []] } }
            }
          }
        ];
        sortCriteria = { score: -1, experience: -1 };
        break;

      case 'tests':
        pipeline = [
          {
            $lookup: {
              from: 'testresults',
              localField: '_id',
              foreignField: 'userId',
              as: 'testResults'
            }
          },
          {
            $addFields: {
              totalTests: { $size: '$testResults' },
              averageScore: { $avg: '$testResults.score' },
              score: { $avg: '$testResults.score' }
            }
          }
        ];
        sortCriteria = { score: -1, totalTests: -1 };
        break;      case 'submissions':
        pipeline = [
          {
            $addFields: {
              totalSubmissions: { $size: { $ifNull: ['$submissions', []] } },
              successfulSubmissions: {
                $size: {
                  $filter: {
                    input: { $ifNull: ['$submissions', []] },
                    as: 'sub',
                    cond: { $eq: ['$$sub.status', 'Accepted'] }
                  }
                }
              },
              score: { $size: { $ifNull: ['$submissions', []] } }
            }
          }
        ];
        sortCriteria = { score: -1, successfulSubmissions: -1 };
        break;

      case 'experience':
      default:
        pipeline = [
          {
            $addFields: {
              score: '$experience'
            }
          }
        ];
        sortCriteria = { score: -1, level: -1 };
        break;
    }    // Complete pipeline
    const fullPipeline = [
      {
        $match: {
          name: { $exists: true, $ne: null, $ne: "" }
        }
      },
      ...pipeline,
      {        $project: {
          _id: 1,
          username: '$name', // Map 'name' field to 'username' for frontend compatibility
          email: 1,
          avatar: 1,
          level: 1,
          experience: 1,
          score: { $round: [{ $ifNull: ['$score', 0] }, 1] },          totalProblemsSolved: { $ifNull: ['$totalProblemsSolved', { $size: { $ifNull: ['$solvedProblems', []] } }] },
          totalTests: { $ifNull: ['$totalTests', 0] },
          totalSubmissions: { $ifNull: ['$totalSubmissions', { $size: { $ifNull: ['$submissions', []] } }] },
          successfulSubmissions: { $ifNull: ['$successfulSubmissions', 0] }
        }
      },
      { $sort: sortCriteria },
      { $skip: skip },
      { $limit: parseInt(limit) }
    ];

    const leaderboard = await User.aggregate(fullPipeline);
    
    // Add rank
    const rankedLeaderboard = leaderboard.map((user, index) => ({
      ...user,
      rank: skip + index + 1
    }));    const totalUsers = await User.countDocuments({
      name: { $exists: true, $ne: null, $ne: "" }
    });

    res.status(200).json({
      success: true,
      data: {
        leaderboard: rankedLeaderboard,
        category,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalUsers,
          pages: Math.ceil(totalUsers / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch category leaderboard',
      error: error.message
    });
  }
};

// Get leaderboard statistics
const getLeaderboardStats = async (req, res) => {  try {    const stats = await User.aggregate([
      {
        $match: {
          name: { $exists: true, $ne: null, $ne: "" }
        }
      },
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          totalExperience: { $sum: '$experience' },
          averageLevel: { $avg: '$level' },
          totalProblems: { 
            $sum: { 
              $size: { 
                $ifNull: ['$solvedProblems', []] 
              } 
            } 
          },
          totalSubmissions: { 
            $sum: { 
              $size: { 
                $ifNull: ['$submissions', []] 
              } 
            } 
          }
        }
      }
    ]);

    const testStats = await TestResult.aggregate([
      {
        $group: {
          _id: null,
          totalTests: { $sum: 1 },
          averageScore: { $avg: '$score' },
          totalQuestions: { $sum: '$totalQuestions' }
        }
      }
    ]);

    const problemStats = await Problem.aggregate([
      {
        $group: {
          _id: '$difficulty',
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        userStats: stats[0] || {},
        testStats: testStats[0] || {},
        problemStats: problemStats.reduce((acc, stat) => {
          acc[stat._id.toLowerCase()] = stat.count;
          return acc;
        }, {}),
        lastUpdated: new Date()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leaderboard statistics',
      error: error.message
    });
  }
};

module.exports = {
  getGlobalLeaderboard,
  getUserLeaderboardPosition,
  getCategoryLeaderboard,
  getLeaderboardStats
};
