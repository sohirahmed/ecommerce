import express from 'express'
import * as UC from './user.controller.js'
import { auth } from '../../middleware/auth.js'
import { systemRoles } from '../../utils/systemRoles.js'
const router = express.Router()

router.get('/' ,auth(), UC.getUser)
router.post('/signUp' , UC.signUp)
router.post('/signIn' , UC.signIn)
router.get('/verifyEmail/:token' , UC.verifyEmail)
router.get('/refreshToken/:refToken' , UC.refreshToken)
router.patch('/sendCode' , UC.forgotPassword)
router.patch('/resetPassword' , UC.resetPassword)


export default router