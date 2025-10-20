import express from 'express'
import bycrypt from 'bcryptjs'
import { User } from '../model/user.ts'
import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '@repo/backend-common/config'


const router: express.Router = express.Router()

router.post('/signup', async (req, res) => {
    const { username, password } = req.body
    const hashedPassword = await bycrypt.hash(password, 10)
    const user = await User.findByIdAndUpdate(req.user._id, { username, password: hashedPassword }, { new: true })
    res.json(user)
})

router.post('/signin', async (req, res) => {
const {username, password} = req.body;
const tokkn= jwt

}
export default router
