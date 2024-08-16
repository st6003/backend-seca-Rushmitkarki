const request = require("supertest");
const app = require("../index");

describe("API Tests", () => {
  let authToken = "";
  let adminToken = "";
  let doctorId = "";
  let adminId = "";
  let favouriteId = "";

  // User Routes
  describe("User API Tests", () => {
    it("Post /create | Register new adopter", async () => {
      const response = await request(app).post("/api/user/create").send({
        firstName: "test",
        lastName: "test",
        email: "test@gmail.com",
        password: "12345678",
        phone: "9843041037",
      });
      if (response.statusCode === 201) {
        expect(response.body.message).toEqual("User Created Successfully!");
      } else {
        expect(response.body.message).toEqual("User already exists...");
      }
    });

    it("Post /register | Register new owner", async () => {
      const response = await request(app).post("/api/user/create").send({
        firstName: "test",
        lastName: "test",
        email: "admin@gmail.com",
        password: "admin",
        phone: "1234567899",
      });

      if (response.statusCode === 201) {
        expect(response.body.message).toEqual("User Registered Successfully!");
      } else {
        expect(response.body.message).toEqual("User already exists...");
      }
    });

    it("Post /login | Login user (adopter)", async () => {
      const response = await request(app).post("/api/user/login").send({
        email: "test@gmail.com",
        password: "12345678",
      });
      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty("token");
      authToken = response.body.token;
    });

    it("Post /login | Login user (owner)", async () => {
      const response = await request(app).post("/api/user/login").send({
        email: "admin@gmail.com",
        password: "admin",
      });
      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty("token");
      adminToken = response.body.token;
    });

    it("Get /get | Get user by id", async () => {
      const response = await request(app)
        .get(`/api/user/get_single_user`)
        .set("Authorization", `Bearer ${authToken}`);
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("user");
      expect(response.body.user).toHaveProperty("email");
      expect(response.body.user.email).toBe("test@gmail.com");
    });
  });

  // Pet Routes
  describe("Doctor API Tests", () => {
    it("Post /add | Add new doctor", async () => {
      const response = await request(app)
        .post("/api/doctor/create")
        .send({
          doctorName: "test",
          doctorField: "test",
          doctorExperience: 1,
          doctorFee: 100,
        })
        .set("Authorization", `Bearer ${adminToken}`);
      console.log(response.body);
      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty("message");
      doctorId = response.body.data._id;
    });

    it("Get /get/:petId | Get doctor by id", async () => {
      const response = await request(app)
        .get(`/api/doctor/get_single_doctor/${doctorId}`)
        .set("Authorization", `Bearer ${authToken}`);
      console.log(response.body);
      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty("doctor");
      expect(response.body.doctor.doctorName).toBe("test");
    });

    it("Get /all | Get All doctors", async () => {
      const response = await request(app)
        .get(`/api/doctor/pagination`)
        .set("Authorization", `Bearer ${authToken}`)
        .query({ page: 1, limit: 5 });
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("doctors");
      const doctors = response.body.doctors;
      expect(doctors.length <= 5).toBe(true);
    });
  });

  // Favorite Routes
  describe("Favorite API Tests", () => {
    it("Post /add | Add favorite pet", async () => {
      const response = await request(app)
        .post(`/api/favourite/add`)
        .send({
          doctorId: doctorId,
        })
        .set("Authorization", `Bearer ${authToken}`);
      console.log(response.body);
      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty("message");
      favouriteId = response.body.newFavorite._id;
    });

    it("Get /get | Get favorite pets", async () => {
      const response = await request(app)
        .get(`/api/favourite/all`)
        .set("Authorization", `Bearer ${authToken}`);
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("favorites");
      const favorites = response.body.favorites;
      expect(favorites.length > 0).toBe(true);
    });

    it("Delete /delete | Delete favorite pet", async () => {
      const response = await request(app)
        .delete(`/api/favourite/delete/${favouriteId}`)
        .set("Authorization", `Bearer ${authToken}`);
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("message");
    });
  });

  // appoitment
  describe("Appointment API Tests", () => {
    it("Post /add | Add appointment", async () => {
      const response = await request(app)
        .post(`/api/booking/create_appointments`)
        .send({
          doctorId: doctorId,
          appointmentDate: Date.now(),
          appointmentDescription: "12:00",
          patientName: "test",
          phoneNumber: "1234567890",
          email: "test@gmail.com",
        })
        .set("Authorization", `Bearer ${authToken}`);
      console.log(response.body);
      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty("message");
    });

    it("Get /get | Get appointments", async () => {
      const response = await request(app)
        .get(`/api/booking/users_with_appointments`)
        .set("Authorization", `Bearer ${adminToken}`);
      expect(response.statusCode).toBe(200);

      expect(response.body).toHaveProperty("appointments");
      const appointments = response.body.appointments;
      expect(appointments.length > 0).toBe(true);
    });
  });

  // Cleanup
  describe("Cleanup", () => {
    it("Delete /delete | Delete pet", async () => {
      const response = await request(app)
        .delete(`/api/doctor/delete_doctor/${doctorId}`)
        .set("Authorization", `Bearer ${adminToken}`);
      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty("message");
    });

    // Commented out user deletion tests
    // it('Delete /delete | Delete adopter', async () => {
    //   const response = await request(app)
    //     .delete(`/api/user/delete`)
    //     .set('Authorization', `Bearer ${authToken}`);
    //   expect(response.statusCode).toBe(200);
    //   expect(response.body).toHaveProperty('message');
    // });
    // it('Delete /delete | Delete owner', async () => {
    //   const response = await request(app)
    //     .delete(`/api/user/delete`)
    //     .set('Authorization', `Bearer ${adminToken}`);
    //   expect(response.statusCode).toBe(200);
    //   expect(response.body).toHaveProperty('message');
    // });
  });
});
