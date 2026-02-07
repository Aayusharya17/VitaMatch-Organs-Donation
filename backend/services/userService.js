const UserRepository = require("../repository/userRepo");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/serverConfig");
const Hospital = require("../models/Hospital");
const GeocodingService = require("./geocodingService");

class UserService {

  constructor() {
    this.userRepository = new UserRepository();
    this.geocodingService = new GeocodingService();
  }

  async createUser(data) {

    const coordinates =
      await this.geocodingService.getCoordinates(data.address);

    if (data.role === "DONOR") {
      const user =  await this.userRepository.createUser({
        ...data,
        location: coordinates
      });
      return jwt.sign(
          { id: user.id, email: user.email, role: user.role },
          JWT_SECRET,
          { expiresIn: "1h" }
        );
    }

    const hospitalObj = await Hospital.findOne({
      name: data.hospitalName,
      address: data.address
    }).select("_id");

    if (!hospitalObj) throw new Error("Hospital not found");
    const user = await this.userRepository.createUser({
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role,
      hospitalId: hospitalObj._id,
      phoneNumber: data.phoneNumber,
      address: data.address,
      location: coordinates
    });

    return jwt.sign(
          { id: user.id, email: user.email, role: user.role },
          JWT_SECRET,
          { expiresIn: "1h" }
        );
  }

  async login(data) {

    const user = await this.userRepository.findUser(data);

    if (!user) throw new Error("Email does not exist");

    const isMatch = await bcrypt.compare(data.password, user.password);

    if (!isMatch) throw new Error("Invalid Password!");

    return jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "1h" }
    );
  }
}

module.exports = UserService;
