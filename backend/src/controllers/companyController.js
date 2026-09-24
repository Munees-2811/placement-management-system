import Company from '../models/Company.js';

/**
 * @desc    Get all companies (with optional search and industry filter)
 * @route   GET /api/companies
 * @access  Private (All authenticated users: STUDENT, PLACEMENT_OFFICER, ADMIN)
 */
export const getCompanies = async (req, res, next) => {
  try {
    const { search, industry, sort = 'createdAt', order = 'desc' } = req.query;

    let query = {};

    // Search across companyName, industry, or location
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { companyName: searchRegex },
        { industry: searchRegex },
        { location: searchRegex },
      ];
    }

    // Exact or case-insensitive industry filter
    if (industry && industry.trim() !== '' && industry !== 'All') {
      query.industry = industry.trim();
    }

    const sortOrder = order === 'asc' ? 1 : -1;
    const sortObj = { [sort]: sortOrder };

    const companies = await Company.find(query).sort(sortObj);

    return res.status(200).json({
      success: true,
      count: companies.length,
      data: companies,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single company by ID
 * @route   GET /api/companies/:id
 * @access  Private (All authenticated users)
 */
export const getCompanyById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const company = await Company.findById(id);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: company,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new company
 * @route   POST /api/companies
 * @access  Private (Restricted to ADMIN and PLACEMENT_OFFICER)
 */
export const createCompany = async (req, res, next) => {
  try {
    const {
      companyName,
      industry,
      location,
      website,
      description,
      contactPerson,
      contactEmail,
    } = req.body;

    // Check if company with exact same name already exists
    const existing = await Company.findOne({ companyName });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Company with name "${companyName}" already exists`,
      });
    }

    const company = await Company.create({
      companyName,
      industry,
      location,
      website,
      description,
      contactPerson,
      contactEmail,
      createdBy: req.user?._id || null,
    });

    return res.status(201).json({
      success: true,
      message: 'Company registered successfully',
      data: company,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update company details
 * @route   PUT /api/companies/:id
 * @access  Private (Restricted to ADMIN and PLACEMENT_OFFICER)
 */
export const updateCompany = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Verify company exists
    const existing = await Company.findById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Company not found',
      });
    }

    // Check duplicate name if companyName is being changed
    if (req.body.companyName && req.body.companyName.toLowerCase() !== existing.companyName.toLowerCase()) {
      const duplicate = await Company.findOne({ companyName: req.body.companyName });
      if (duplicate && String(duplicate._id) !== String(id)) {
        return res.status(400).json({
          success: false,
          message: `Another company with the name "${req.body.companyName}" already exists`,
        });
      }
    }

    const updated = await Company.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({
      success: true,
      message: 'Company updated successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a company
 * @route   DELETE /api/companies/:id
 * @access  Private (Restricted to ADMIN and PLACEMENT_OFFICER)
 */
export const deleteCompany = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await Company.findById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Company not found',
      });
    }

    await Company.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: `Company "${existing.companyName}" deleted successfully`,
      data: { id },
    });
  } catch (error) {
    next(error);
  }
};
