const EMAIL_REGEX = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
const URL_REGEX = /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/i;

export const validateCompanyInput = (data, isUpdate = false) => {
  const errors = [];
  const sanitized = {};

  // For CREATE: companyName is required
  // For UPDATE: companyName is validated only if provided
  if (!isUpdate || data.companyName !== undefined) {
    if (!data.companyName || typeof data.companyName !== 'string' || data.companyName.trim() === '') {
      errors.push({ field: 'companyName', message: 'Company name is required' });
    } else if (data.companyName.trim().length < 2) {
      errors.push({ field: 'companyName', message: 'Company name must be at least 2 characters long' });
    } else if (data.companyName.trim().length > 120) {
      errors.push({ field: 'companyName', message: 'Company name cannot exceed 120 characters' });
    } else {
      sanitized.companyName = data.companyName.trim();
    }
  }

  // Industry
  if (!isUpdate || data.industry !== undefined) {
    if (!data.industry || typeof data.industry !== 'string' || data.industry.trim() === '') {
      errors.push({ field: 'industry', message: 'Industry is required' });
    } else if (data.industry.trim().length > 100) {
      errors.push({ field: 'industry', message: 'Industry cannot exceed 100 characters' });
    } else {
      sanitized.industry = data.industry.trim();
    }
  }

  // Location
  if (!isUpdate || data.location !== undefined) {
    if (!data.location || typeof data.location !== 'string' || data.location.trim() === '') {
      errors.push({ field: 'location', message: 'Location is required' });
    } else if (data.location.trim().length > 120) {
      errors.push({ field: 'location', message: 'Location cannot exceed 120 characters' });
    } else {
      sanitized.location = data.location.trim();
    }
  }

  // Contact Person
  if (!isUpdate || data.contactPerson !== undefined) {
    if (!data.contactPerson || typeof data.contactPerson !== 'string' || data.contactPerson.trim() === '') {
      errors.push({ field: 'contactPerson', message: 'Contact person is required' });
    } else if (data.contactPerson.trim().length > 100) {
      errors.push({ field: 'contactPerson', message: 'Contact person name cannot exceed 100 characters' });
    } else {
      sanitized.contactPerson = data.contactPerson.trim();
    }
  }

  // Contact Email
  if (!isUpdate || data.contactEmail !== undefined) {
    if (!data.contactEmail || typeof data.contactEmail !== 'string' || data.contactEmail.trim() === '') {
      errors.push({ field: 'contactEmail', message: 'Contact email is required' });
    } else if (!EMAIL_REGEX.test(data.contactEmail.trim())) {
      errors.push({ field: 'contactEmail', message: 'Please provide a valid contact email address' });
    } else {
      sanitized.contactEmail = data.contactEmail.trim().toLowerCase();
    }
  }

  // Website (optional)
  if (data.website !== undefined) {
    if (typeof data.website === 'string' && data.website.trim() !== '') {
      const trimmedUrl = data.website.trim();
      if (!URL_REGEX.test(trimmedUrl)) {
        errors.push({ field: 'website', message: 'Please provide a valid website URL (e.g. https://example.com)' });
      } else {
        // Prepend https:// if not present
        sanitized.website = /^https?:\/\//i.test(trimmedUrl) ? trimmedUrl : `https://${trimmedUrl}`;
      }
    } else {
      sanitized.website = '';
    }
  }

  // Description (optional)
  if (data.description !== undefined) {
    if (typeof data.description === 'string') {
      if (data.description.length > 2000) {
        errors.push({ field: 'description', message: 'Description cannot exceed 2000 characters' });
      } else {
        sanitized.description = data.description.trim();
      }
    } else {
      sanitized.description = '';
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitized,
  };
};

export const validateCompany = (req, res, next) => {
  const isUpdate = req.method === 'PUT' || req.method === 'PATCH';
  
  if (isUpdate && (!req.body || Object.keys(req.body).length === 0)) {
    return res.status(400).json({
      success: false,
      message: 'Please provide fields to update',
    });
  }

  const { isValid, errors, sanitized } = validateCompanyInput(req.body, isUpdate);

  if (!isValid) {
    return res.status(400).json({
      success: false,
      message: errors[0]?.message || 'Validation failed for company data',
      errors,
    });
  }

  // Replace req.body with sanitized clean inputs
  req.body = { ...req.body, ...sanitized };
  next();
};
