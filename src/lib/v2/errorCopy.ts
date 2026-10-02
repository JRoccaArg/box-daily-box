// Public messages only. Never render backend bodies or exceptions.
export const ERROR_COPY: Record<number, [string,string]> = {
 400:['Revisa la solicitud','Revisa los datos e inténtalo de nuevo.'],
 401:['Vuelve a iniciar sesión','Tu sesión necesita renovarse para continuar.'],
 403:['No puedes realizar esta acción','No tienes acceso desde tu sesión actual.'],
 404:['No encontramos esta página','El enlace puede haber cambiado o ya no estar disponible.'],
 405:['Esta acción no está disponible','Vuelve a la página anterior y utiliza sus opciones.'],
 408:['La solicitud tardó demasiado','Comprueba tu conexión antes de volver a intentarlo.'],
 409:['La información ha cambiado','Actualiza la vista antes de continuar.'],
 410:['Este enlace ya no está disponible','Vuelve al inicio para continuar.'],
 413:['El contenido es demasiado grande','Reduce su tamaño antes de enviarlo de nuevo.'],
 415:['Este formato no es compatible','Utiliza un formato admitido por esta acción.'],
 422:['Hay datos que debes revisar','Revisa los campos indicados antes de continuar.'],
 429:['Espera un momento','Has realizado varias solicitudes seguidas. Inténtalo más tarde.'],
 500:['No pudimos completar la acción','Inténtalo de nuevo más tarde.'],
 502:['No pudimos conectar con el servicio','Inténtalo de nuevo más tarde.'],
 503:['El servicio no está disponible','Inténtalo de nuevo más tarde.'],
 504:['El servicio está tardando demasiado','Comprueba el estado antes de repetir la acción.'],
};
export function errorCopy(status:number,offline=false):[string,string] {
 return offline ? ['Sin conexión','Revisa tu conexión a internet antes de continuar.'] : ERROR_COPY[status] ?? ['No pudimos completar la solicitud','Inténtalo de nuevo más tarde.'];
}
