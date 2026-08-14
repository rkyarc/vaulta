import { NextResponse } from "next/server";
import { ZodError } from "zod";

// Standar balasan ketika API berhasil (Success 2xx)
export function successResponse<T>(data: T, message = "Berhasil", status = 200) {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
    },
    { status }
  );
}

// Standar balasan ketika API gagal/error (Client Error 4xx atau Server Error 500)
export function errorResponse(message = "Terjadi kesalahan pada server", status = 500, errors?: any) {
  return NextResponse.json(
    {
      success: false,
      message,
      errors,
    },
    { status }
  );
}

// Alat bantu khusus untuk merapikan error dari Zod menjadi pesan yang mudah dibaca
export function zodErrorResponse(error: ZodError) {
  const errorMessage = error.issues[0]?.message || "Validasi data gagal";
  return errorResponse(errorMessage, 400, error.issues);
}