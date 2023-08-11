import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import './swal.less'

const swal = withReactContent(Swal)

async function alertsm (titleText: string, text?: string): Promise<void> {
  await swal.fire({
    titleText,
    text,
    toast: true,
    position: 'top-end',
    timer: 2000,
    timerProgressBar: true,
    showConfirmButton: false,
    target: '#stage'
  })
}

export { alertsm }
