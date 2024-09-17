import { Router } from "express";
import {
	query,
	validationResult,
	checkSchema,
	matchedData,
} from "express-validator";
import { User } from "../mongoose/schemas/user.mjs";
import { createUserValidationSchema } from "../utils/validationSchemas.mjs";
import { resolveIndexByUserId } from "../utils/middlewares.mjs";
import { User } from "../mongoose/schemas/user.mjs";
import { hashPassword } from "../utils/helpers.mjs";
import { createUserHandler, getUserByIdHandler } from "../handlers/users.mjs";

const router = Router();

router.get(
	"/api/users",
	query("filter")
		.isString()
		.notEmpty()
		.withMessage("Must not be empty")
		.isLength({ min: 3, max: 10 })
		.withMessage("Must be at least 3-10 characters"),
	(req, res) => {
		req.sessionStore.get(req.session.id, (err, sessionData) => {
			if (err) {
				throw err;
			}
		});
		const result = validationResult(req);
		const {
			query: { filter, value },
		} = req;
		if (filter && value)
			return res.send(
				User.filter((user) => user[filter].includes(value))
			);
		return res.send(User);
	}
);

router.get("/api/users/:id", resolveIndexByUserId, getUserByIdHandler);

router.post(
	"/api/users",
	checkSchema(createUserValidationSchema),
	createUserHandler
);

router.put("/api/users/:id", resolveIndexByUserId, (req, res) => {
	const { body, findUserIndex } = req;
	User[findUserIndex] = { id: User[findUserIndex].id, ...body };
	return res.sendStatus(200);
});

router.patch("/api/users/:id", resolveIndexByUserId, (req, res) => {
	const { body, findUserIndex } = req;
	User[findUserIndex] = { ...User[findUserIndex], ...body };
	return res.sendStatus(200);
});

router.delete("/api/users/:id", resolveIndexByUserId, (req, res) => {
	const { findUserIndex } = req;
	User.splice(findUserIndex, 1);
	return res.sendStatus(200);
});

export default router;
