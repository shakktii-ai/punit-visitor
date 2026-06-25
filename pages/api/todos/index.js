import Todo from '@/models/todo';
import connectDb from '@/middleware/mongoose';

const handler = async (req, res) => {
  // GET: Fetch all Todos
  if (req.method === 'GET') {
    try {
      const todos = await Todo.find({}).sort({ date: 1 });
      return res.status(200).json({ success: true, todos });
    } catch (error) {
      console.error('Error fetching todos:', error);
      return res.status(500).json({ success: false, error: 'Failed to fetch tasks.' });
    }
  }

  // POST: Create a Todo
  if (req.method === 'POST') {
    try {
      const { title, description, date } = req.body;
      if (!title || !date) {
        return res.status(400).json({ success: false, error: 'Title and Date are required.' });
      }

      const newTodo = new Todo({
        title,
        description: description || '',
        date: new Date(date),
      });

      await newTodo.save();
      return res.status(200).json({ success: true, todo: newTodo });
    } catch (error) {
      console.error('Error creating todo:', error);
      return res.status(500).json({ success: false, error: 'Failed to create task.' });
    }
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
};

export default connectDb(handler);
