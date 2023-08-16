import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import './swal.less'

const swal = withReactContent(Swal)

function alertsm (titleText: string, text?: string): void {
  swal.fire({
    titleText,
    text,
    toast: true,
    position: 'top-end',
    timer: 2000,
    timerProgressBar: true,
    showConfirmButton: false,
    target: '#stage'
  }).catch(() => null)
}

export { alertsm }
