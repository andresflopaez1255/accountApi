import { Request, Response } from "express";
import prisma from "../utils/dbClient";
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import { Vendor } from "../models/auth.vendors.interfaces";
import messageBody from "../utils/messageBody";
import { MessagesAuth } from "../utils/messages";
import jwt from "jsonwebtoken";
import { generateCode } from "../utils/codeGenerator";

interface VendorLogIn {
    email?: string,
    num_doc?: string,
    password: string
}
async function vendorRegistration(req: Request, res: Response) {
    const body: Vendor = req.body
    try {
        const vendorExists = await prisma.vendors.findFirst({
            where: {
                email: body.email
            }
        })
        if (!vendorExists) {
            const salt = await bcrypt.genSalt(12)
            const password = await bcrypt.hash(body.password, salt)
            const token = jwt.sign({
                email: body.email,
                id: body.id_vendor
            }, Date.now().toString(), { expiresIn: 60 * 60 });
            const vendor: Vendor = {
                ...body,
                password: password,
                id_vendor: uuidv4(),
                access_token: token
            }
            await prisma.vendors.create({
                data: vendor
            }).catch(console.log)
            res.status(200).json(messageBody(null, MessagesAuth.created, true))
            return;
        }
        res.status(400).json(messageBody(null, MessagesAuth.vendorAlreadyExists, true))
    } catch (error) {
        res.status(405).json(messageBody(null, `error: ${error}`, false))
    }
}
async function vendorLogIn(req: Request, res: Response) {
    try {
        const body: VendorLogIn = req.body;
        const vendorExists = await prisma.vendors.findFirst({
            where: {
                OR: [
                    {
                        num_doc: body.num_doc,
                    },
                    {
                        email: body.email
                    }

                ]

            }
        })

        if (vendorExists) {

            const resBody = {
                id: vendorExists.id,
                id_vendor: vendorExists.id_vendor,
                access_token: vendorExists.access_token ?? "",
                email: vendorExists.email,
                num_doc: vendorExists.num_doc,
                type_doc: vendorExists.type_doc
            };

            res.status(200).json(messageBody(resBody, MessagesAuth.successful, true))

        } else {
            res.status(400).json(messageBody(null, MessagesAuth.notSuccessful, true))

        }

    } catch (error) {

    }
}

async function vendorRecoveryPass(req: Request, res: Response) {
    try {
        const body = req.body
        const vendor = await prisma.vendors.findFirst({
            where: {
                AND: [
                    {
                        type_doc: body.type_doc,
                    },
                    {
                        num_doc: body.num_doc
                    }
                ]
            }
        })

        if (vendor) {
            const code = generateCode();
            const codeRecovery = await prisma.vendor_recovery.create({
                data: {
                    id_vendor: vendor?.id_vendor,
                    code_reco: code
                }

            })
            res.status(200).json(messageBody({codeRecovery}, "code for recovery generated sucessfully", true))

            setTimeout(async () => {
                await prisma.vendor_recovery.delete({
                    where:{
                        id: codeRecovery.id
                    }
                })
            }, 600000);
            return;
        }else{
            res.status(400).json(messageBody(null, MessagesAuth.notSuccessful, true))
        }
    } catch (error) {
        res.status(403).json(messageBody(null, `error: ${error}`, true))
    }
}

export {
    vendorRegistration,
    vendorLogIn,
    vendorRecoveryPass
}