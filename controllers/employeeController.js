const pool = require('../config/database');

// 🕘 Submit Attendance
exports.submitAttendance = async (req, res) => {
  const { date, punch_in, punch_out, status } = req.body;
  const userId = req.params.id;


  try {
    await pool.query(
      'INSERT INTO attendance (user_id, date, punch_in, punch_out, status) VALUES ($1, $2, $3, $4, $5)',
      [userId, date, punch_in, punch_out, status]
    );

    res.status(201).json({ message: 'Attendance submitted' });
  } catch (err) {
    console.error('Error inserting attendance:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};


// 📝 Apply Leave
exports.applyLeave = async (req, res) => {
  const userId = req.params.id; // Get user ID from route param
  const { leave_type, start_date, end_date, reason } = req.body;

  try {
    await pool.query(
      `INSERT INTO leaves (user_id, leave_type, start_date, end_date, reason, manager_approval, director_approval)
       VALUES ($1, $2, $3, $4, $5, 'pending', 'pending')`,
      [userId, leave_type, start_date, end_date, reason]
    );

    res.status(201).json({ message: 'Leave request submitted' });
  } catch (err) {
    console.error('Error submitting leave request:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};



// ✅ Submit Task Progress
exports.submitTaskProgress = async (req, res) => {
  const { task_id, progress } = req.body;
  const userId = req.params.id; // Get user ID from the route
  const status = progress === 100 ? 'completed' : 'in_progress';

  try {
    await pool.query(
      'UPDATE tasks SET progress = $1, status = $2 WHERE id = $3 AND user_id = $4',
      [progress, status, task_id, userId]
    );

    res.status(200).json({ message: 'Task progress updated' });
  } catch (err) {
    console.error('Error updating task progress:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
exports.submitProgressReport = async (req, res) => {
  const {
    user_id,
    date,
    accomplishments,
    challenges,
    tomorrows_plan,
    overall_progress // optional
  } = req.body;

  // Validate required fields
  if (!user_id || !date || !accomplishments) {
    return res.status(400).json({
      error: 'Missing required fields: user_id, date, or accomplishments',
    });
  }

  const wordCount = accomplishments.trim().split(/\s+/).length;
  const daily_progress = Math.min(100, Math.round((wordCount / 50) * 100));
  const progressValue = overall_progress || daily_progress;

  // 🟡 Determine status based on overall_progress
  const status = progressValue >= 100 ? 'completed' : 'in_progress';

  try {
    await pool.query(
      `INSERT INTO daily_progress 
       (user_id, date, accomplishments, daily_progress, overall_progress, challenges, tomorrows_plan, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        user_id,
        date,
        accomplishments,
        daily_progress,
        progressValue,
        challenges || null,
        tomorrows_plan || null,
        status
      ]
    );

    res.status(201).json({ message: 'Progress submitted successfully' });
  } catch (err) {
    console.error('Error inserting progress:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};



// 🙋‍♂️ Get Logged-In Profile
exports.getProfile = async (req, res) => {
  const userId = req.params.id;

  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [userId]
    );

    const data = result.rows[0];

    if (!data) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Optional: Convert relative profile image to absolute URL
    if (data.profile_image_url && !data.profile_image_url.startsWith('http')) {
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      data.profile_image_url = `${baseUrl}${data.profile_image_url}`;
    }

    res.status(200).json(data);
  } catch (err) {
    console.error('Error fetching profile:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};




// 🧍‍♂️ Get Attendance by ID (with Auth Check)
exports.getAttendanceById = async (req, res) => {
  const requestedId = req.params.id;
  // const authenticatedId = req.user.id;

  // if (requestedId !== authenticatedId) {
  //   return res.status(403).json({ error: 'Unauthorized access' });
  // }

  try {
    const result = await pool.query(
      'SELECT * FROM attendance WHERE user_id = $1',
      [requestedId]
    );

    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching attendance:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};


// 🍃 Get Leaves
exports.getLeaves = async (req, res) => {
  const requestedId = req.params.id;

  // Ensure the logged-in user is requesting only their own data
  if (req.user.id !== requestedId) {
    return res.status(403).json({ error: 'Unauthorized access to leave data' });
  }

  try {
    const result = await pool.query(
      'SELECT * FROM leaves WHERE user_id = $1',
      [requestedId]
    );

    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching leaves:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};





// 🧩 Get Tasks
exports.getTasks = async (req, res) => {
  const requestedId = req.params.id;

  // Ensure user making request is the same as the requested ID
  if (req.user.id !== requestedId) {
    return res.status(403).json({ error: 'Unauthorized access' });
  }

  try {
    const result = await pool.query(
      'SELECT * FROM tasks WHERE user_id = $1',
      [requestedId]
    );

    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};





// 📊 Get Progress
exports.getProgressReport = async (req, res) => {
  const requestedId = req.params.id ;

  // if (requestedId !== req.user.id) {
  //   return res.status(403).json({ error: 'Unauthorized access' });
  // }

  try {
    const result = await pool.query(
      'SELECT * FROM daily_progress WHERE user_id = $1',
      [requestedId]
    );

    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching progress:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
