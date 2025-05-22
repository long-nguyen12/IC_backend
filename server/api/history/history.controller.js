const History = require("./history.model");










exports.createHistory = async (userId,Email, action, details) => {
try {
    const historyRecord = new History({
        userId ,
        Email,
        action
    });
        return historyRecord.save();
    } catch (error) {

        console.log(`Error processing file`,error)
        console.error(`Error processing file :`, error)
    }
};
  
 
exports.getHistories = async (req, res) => {
    try {
        const histories = await History.find();
        res.status(200).json(histories);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving histories', error: error.message });
    }
};
  
 
// exports.getHistoryById = async (req, res) => {
// try {
//     const { id } = req.params;
//     const history = await History.findById(id);
//     if (!history) {
//     return res.status(404).json({ message: 'History not found' });
//     }
//     res.status(200).json(history);
// } catch (error) {
//     res.status(500).json({ message: 'Error retrieving history', error: error.message });
// }
// };
  
 
// exports.updateHistory = async (req, res) => {
// try {
//     const { id } = req.params;
//     const { userId, action, page, details } = req.body;
//     const updatedHistory = await History.findByIdAndUpdate(
//     id,
//     { userId, action, page, details },
//     { new: true }
//     );
//     if (!updatedHistory) {
//     return res.status(404).json({ message: 'History not found' });
//     }
//     res.status(200).json(updatedHistory);
// } catch (error) {
//     res.status(500).json({ message: 'Error updating history', error: error.message });
// }
// };


// exports.deleteHistory = async (req, res) => {
// try {
//     const { id } = req.params;
//     const deletedHistory = await History.findByIdAndDelete(id);
//     if (!deletedHistory) {
//     return res.status(404).json({ message: 'History not found' });
//     }
//     res.status(200).json({ message: 'History deleted successfully' });
// } catch (error) {
//     res.status(500).json({ message: 'Error deleting history', error: error.message });
// }
// };

