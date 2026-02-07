const { JWT_SECRET } = require("../config/serverConfig");
const DonorService = require("../services/donorService");
const jwt = require('jsonwebtoken');
const donorServ = new DonorService;

const createDonation = async (req,res) => {
    try {
        if(!req.user){
            throw new Error('User not logged-in !!');
        }
        const donorId = req.user.id;
        const role = req.user.role;
        const address = req.body.address;
        const organName = req.body.organName;
        const bloodGroup = req.body.bloodGroup;
        const donateOrgan = await donorServ.createDonation({
            organName,bloodGroup,donorId,role,address
        })
        return res.status(201).json({
            data : donateOrgan,
            success:true,
            messgae:'Successfully added organ for donation',
            err : {}
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            data : {},
            succes : false,
            message : 'Request Failed',
            err : error
        })
    }
}

const confirmDonation = async(req,res) => {
    try {
        const donatedOrganId = req.body.organId;
        const consentType = req.body.consentType;
        const donorId = req.user.id;
        const confirmed = await donorServ.confirmDonation(donatedOrganId,donorId,consentType);
        return res.status(201).json({
            data : confirmed,
            success:true,
            messgae:'Successfully confirmed organ for donation',
            err : {}
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            data : {},
            succes : false,
            message : 'Request Failed',
            err : error
        })
    }
}

const findAllRequests = async (req,res) => {
    try {
        const bloodGroup = req.query.bloodGroup;
        const organName = req.query.organName;
        const requests = await donorServ.findAllRequests({bloodGroup,organName})
        return res.status(201).json({
            data : requests,
            success:true,
            messgae:'Successfully fetched all',
            err : {}
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            data : {},
            succes : false,
            message : 'Request Failed',
            err : error
        })
    }
}

const confirmAllocation = async (req, res) => {
  const allocation = await donorServ.confirmAllocation(req.params.id);
  res.json({ success: true, allocation });
};

const rejectAllocation = async (req, res) => {
  const allocation = await donorServ.rejectAllocation(req.params.id);
  res.json({ success: true, allocation });
};

const findAll = async (req,res) => {
    try {
        if(!req.user){
            throw new Error('Not Authenticated');
        }
        const all = await donorServ.findAll(req.user.id);
        return res.status(201).json({
            message : 'Successfully fetched all',
            data : all ,
            err : {},
            success : true
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            data : {},
            succes : false,
            message : 'Request Failed',
            err : error
        })
    }
}

module.exports = {
    createDonation,
    confirmDonation,
    findAllRequests,
    rejectAllocation,
    confirmAllocation,
    findAll
}