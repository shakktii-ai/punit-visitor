import Todo from '@/models/todo';
import connectDb from '@/middleware/mongoose';

const handler = async (req, res) => {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ success: false, error: 'Task ID is required.' });
  }

  // PUT: Update a Todo
  if (req.method === 'PUT') {
    try {
      const updatedData = req.body;
      const updatedTodo = await Todo.findByIdAndUpdate(id, updatedData, { new: true });
      if (!updatedTodo) {
        return res.status(404).json({ success: false, error: 'Task not found.' });
      }
      return res.status(200).json({ success: true, todo: updatedTodo });
    } catch (error) {
      console.error('Error updating todo:', error);
      return res.status(500).json({ success: false, error: 'Failed to update task.' });
    }
  }

  // DELETE: Delete a Todo
  if (req.method === 'DELETE') {
    try {
      const deletedTodo = await Todo.findByIdAndDelete(id);
      if (!deletedTodo) {
        return res.status(404).json({ success: false, error: 'Task not found.' });
      }
      return res.status(200).json({ success: true, message: 'Task deleted successfully.' });
    } catch (error) {
      console.error('Error deleting todo:', error);
      return res.status(500).json({ success: false, error: 'Failed to delete task.' });
    }
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
};

export default connectDb(handler);
