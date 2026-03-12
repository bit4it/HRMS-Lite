type Props = {
  message: string
  variant: 'error' | 'empty' | 'success'
}

export default function StatusMessage({ message, variant }: Props) {
  return <p className={`status-message ${variant}`}>{message}</p>
}
