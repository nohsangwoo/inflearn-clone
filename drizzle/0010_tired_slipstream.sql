CREATE INDEX "EnrollmentRequest_lecture_status_idx" ON "EnrollmentRequest" USING btree ("lectureId","status");--> statement-breakpoint
CREATE INDEX "Lecture_active_createdAt_idx" ON "Lecture" USING btree ("isActive","createdAt");--> statement-breakpoint
CREATE INDEX "Like_lecture_idx" ON "Like" USING btree ("lectureId");--> statement-breakpoint
CREATE INDEX "Like_user_lecture_idx" ON "Like" USING btree ("userId","lectureId");--> statement-breakpoint
CREATE INDEX "Purchase_lecture_idx" ON "Purchase" USING btree ("lectureId");--> statement-breakpoint
CREATE INDEX "Review_lecture_parent_deleted_createdAt_idx" ON "Review" USING btree ("lectureId","parentId","isDeleted","createdAt");--> statement-breakpoint
CREATE INDEX "Review_user_lecture_idx" ON "Review" USING btree ("userId","lectureId");