//controller/quotationEditorController.js
const QuotationEditor = require('../models/QuotationEditor');

exports.getAll = async (_req, res) => {
  const quotations = await QuotationEditor.find().sort({ createdAt: -1 });
  res.json(quotations);
};

exports.getByProject = async (req, res) => {
  const projectId = req.params.projectId;
  const quotations = await QuotationEditor.find({ "header.projectId": projectId });
  res.json(quotations);
};

exports.getOne = async (req, res) => {
  const quotation = await QuotationEditor.findById(req.params.id);
  if (!quotation) return res.status(404).json({ msg: 'Not found' });
  res.json(quotation);
};

// controllers/quotationEditorController.js
const Project = require('../models/Project'); // ✅ add this at the top

exports.create = async (req, res) => {
  try {
    const quotation = await QuotationEditor.create(req.body);

   
    const projectId = req.body.header?.projectId;
    if (projectId) {
      await Project.findByIdAndUpdate(projectId, {
        quotationId: quotation._id
      });
    }

    res.status(201).json(quotation);
  } catch (error) {
    console.error("Create error:", error);
    res.status(400).json({ 
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};


// Similarly for update
exports.createNewRevision = async (req, res) => {
  const originalId = req.params.id;

  if (!originalId || originalId === "undefined") {
    return res.status(400).json({ msg: "Invalid quotation ID" });
  }

  try {
    const oldQuotation = await QuotationEditor.findById(originalId);
    if (!oldQuotation) {
      return res.status(404).json({ msg: "Original quotation not found" });
    }

    // Increment revision number
    const newRevision = (oldQuotation.header.revision ?? 0) + 1;

    // Clone and override
    const newQuotation = await QuotationEditor.create({
      ...oldQuotation.toObject(),
      ...req.body,
      _id: undefined, // force new document
      header: {
        ...req.body.header,
        revision: newRevision,
      }
    });

    // ✅ Optional: update project with new quotation ID
    const projectId = req.body.header?.projectId;
    if (projectId) {
      await Project.findByIdAndUpdate(projectId, { quotationId: newQuotation._id });
    }

    res.status(201).json(newQuotation);
  } catch (error) {
    console.error("Revision update error:", error);
    res.status(500).json({ message: "Failed to create new revision" });
  }
};



exports.remove = async (req, res) => {
  const quotation = await QuotationEditor.findByIdAndDelete(req.params.id);
  if (!quotation) return res.status(404).json({ msg: 'Not found' });
  res.json({ msg: 'Deleted' });
};
