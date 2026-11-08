export type ClaimDemoMode = 'success' | 'conflict' | 'network-error'

export interface ClaimResult {
  readonly claimId: string
  readonly dropId: string
}

export class ClaimError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ClaimError'
    this.status = status
  }
}

// Mô phỏng phản hồi API, chưa gửi yêu cầu hay cập nhật kho trên backend.
export async function claimDrop(
  dropId: string,
  mode: ClaimDemoMode = 'success',
): Promise<ClaimResult> {
  await new Promise<void>((resolve) => {
    window.setTimeout(resolve, 1200)
  })

  if (mode === 'conflict') {
    throw new ClaimError(409, 'Vật phẩm đã hết hàng.')
  }

  if (mode === 'network-error') {
    throw new Error('Không kết nối được máy chủ.')
  }

  return {
    claimId: crypto.randomUUID(),
    dropId,
  }
}
