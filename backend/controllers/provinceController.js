const { Province } = require('../models');

// Get all provinces
exports.getAllProvinces = async (req, res) => {
  try {
    const provinces = await Province.findAll({
      order: [['name', 'ASC']]
    });

    res.status(200).json({
      status: 'success',
      data: {
        provinces
      }
    });
  } catch (error) {
    console.error('Error fetching provinces:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch provinces'
    });
  }
};

// Get province by ID
exports.getProvinceById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const province = await Province.findByPk(id);
    
    if (!province) {
      return res.status(404).json({
        status: 'error',
        message: 'Province not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        province
      }
    });
  } catch (error) {
    console.error('Error fetching province:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch province'
    });
  }
};

// Create new province (Admin only)
exports.createProvince = async (req, res) => {
  try {
    const { name, code, country } = req.body;

    // Check if province already exists
    const existingProvince = await Province.findOne({
      where: { name }
    });

    if (existingProvince) {
      return res.status(400).json({
        status: 'error',
        message: 'Province with this name already exists'
      });
    }

    const province = await Province.create({
      name,
      code,
      country
    });

    res.status(201).json({
      status: 'success',
      message: 'Province created successfully',
      data: {
        province
      }
    });
  } catch (error) {
    console.error('Error creating province:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create province'
    });
  }
};

// Update province (Admin only)
exports.updateProvince = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const province = await Province.findByPk(id);
    
    if (!province) {
      return res.status(404).json({
        status: 'error',
        message: 'Province not found'
      });
    }

    await province.update(updateData);

    res.status(200).json({
      status: 'success',
      message: 'Province updated successfully',
      data: {
        province
      }
    });
  } catch (error) {
    console.error('Error updating province:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update province'
    });
  }
};

// Delete province (Admin only)
exports.deleteProvince = async (req, res) => {
  try {
    const { id } = req.params;

    const province = await Province.findByPk(id);
    
    if (!province) {
      return res.status(404).json({
        status: 'error',
        message: 'Province not found'
      });
    }

    await province.destroy();

    res.status(200).json({
      status: 'success',
      message: 'Province deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting province:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete province'
    });
  }
};
