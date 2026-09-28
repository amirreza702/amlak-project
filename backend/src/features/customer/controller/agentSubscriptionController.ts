import { Request, Response } from "express";

import {
  createAgentSubscriptionService,
  upgradeAgentSubscriptionService,
} from "../service/agentSubscriptionService";

/**
 * ایجاد Subscription
 */
export const createAgentSubscriptionController = async (
  req: Request,
  res: Response
) => {
  try {
    const agentId =
      req.params.agentId as string;

    const {
      planId,
      startsAt,
      expiresAt,
    } = req.body;

    if (!agentId) {
      return res.status(400).json({
        message: "agentId is required",
      });
    }

    if (
      !planId ||
      !startsAt
    ) {
      return res.status(400).json({
        message:
          "planId and startsAt are required",
      });
    }

    const subscription =
      await createAgentSubscriptionService(
        agentId,
        planId,
        new Date(startsAt),
        expiresAt
          ? new Date(expiresAt)
          : undefined
      );

    return res.status(201).json(
      subscription
    );
  } catch (error) {
    if (
      error instanceof Error &&
      error.message ===
        "Agent already has an active subscription"
    ) {
      return res.status(400).json({
        message: error.message,
      });
    }

    if (
      error instanceof Error &&
      error.message ===
        "Subscription plan not found"
    ) {
      return res.status(404).json({
        message: error.message,
      });
    }

    if (
      error instanceof Error &&
      error.message ===
        "Subscription plan is not active"
    ) {
      return res.status(400).json({
        message: error.message,
      });
    }

    if (
      error instanceof Error &&
      error.message ===
        "Subscription expiration cannot be before start"
    ) {
      return res.status(400).json({
        message: error.message,
      });
    }

    console.error(
      "Error creating agent subscription:",
      error
    );

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

/**
 * ارتقای Subscription
 */
export const upgradeAgentSubscriptionController = async (
  req: Request,
  res: Response
) => {
  try {
    const agentId =
      req.params.agentId as string;

    const {
      planId,
    } = req.body;

    if (!agentId) {
      return res.status(400).json({
        message: "agentId is required",
      });
    }

    if (!planId) {
      return res.status(400).json({
        message: "planId is required",
      });
    }

    const subscription =
      await upgradeAgentSubscriptionService(
        agentId,
        planId
      );

    return res.status(200).json(
      subscription
    );
  } catch (error) {
    if (
      error instanceof Error &&
      error.message ===
        "Active subscription not found"
    ) {
      return res.status(404).json({
        message: error.message,
      });
    }

    if (
      error instanceof Error &&
      error.message ===
        "Subscription plan not found"
    ) {
      return res.status(404).json({
        message: error.message,
      });
    }

    if (
      error instanceof Error &&
      error.message ===
        "Subscription plan is not active"
    ) {
      return res.status(400).json({
        message: error.message,
      });
    }

    if (
      error instanceof Error &&
      error.message ===
        "New subscription plan must be higher than current plan"
    ) {
      return res.status(400).json({
        message: error.message,
      });
    }

    console.error(
      "Error upgrading agent subscription:",
      error
    );

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};